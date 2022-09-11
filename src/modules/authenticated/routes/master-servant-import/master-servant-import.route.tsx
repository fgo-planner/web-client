import { Array2D, Immutable, ImmutableRecord, Nullable, ReadonlyRecord } from '@fgo-planner/common-core';
import { GameServant, MasterAccount, MasterServant, MasterServantUtils } from '@fgo-planner/data-core';
import { FgoManagerParsers, TransformLogger } from '@fgo-planner/transform-core';
import { Options } from 'csv-parse';
import { parse } from 'csv-parse/sync';
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertDialog } from '../../../../components/dialog/alert-dialog.component';
import { useGameServantList } from '../../../../hooks/data/use-game-servant-list.hook';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useLoadingIndicator } from '../../../../hooks/user-interface/use-loading-indicator.hook';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { MasterServantParserResult } from '../../../../services/import/master-servant-parser-result.type';
import { MasterServantUpdateIndeterminateValue as IndeterminateValue } from '../../../../types/internal';
import { MasterServantUpdateUtils } from '../../../../utils/master/master-servant-update.utils';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { MasterServantImportExistingAction as ExistingAction } from './master-servant-import-existing-servants-action.enum';
import { MasterServantImportFileInput } from './master-servant-import-file-input';
import { MasterServantImportList } from './master-servant-import-list.component';

console.log('MasterServantImportRoute loaded');

type ImportStatus =
    'none' |
    'parseFail' |
    'importFail' |
    'parseSuccess' |
    'importSuccess';

const ParseFailMessage = 'No servants could be parsed from the given data! Please review the data and try again.';

const ParseSuccessMessage = 'Servants parsed successfully! Please review the list and click the confirm button to finalize the import.';

const ImportFailMessage = 'An error was encountered while attempting to import servants.';

const ImportSuccessMessage = 'Servants imported successfully!';

const ImportStatusMessages = {
    'parseFail': ParseFailMessage,
    'parseSuccess': ParseSuccessMessage,
    'importFail': ImportFailMessage,
    'importSuccess': ImportSuccessMessage
} as ReadonlyRecord<ImportStatus, string>;

// TODO Move this to a CSV parsing utility
const CsvParseOptions: Options = {
    delimiter: ',',
    skipEmptyLines: true
};

// TODO Split into smaller components
const MasterServantImportRoute = React.memo(() => {

    const navigate = useNavigate();

    const {
        invokeLoadingIndicator,
        resetLoadingIndicator,
        isLoadingIndicatorActive
    } = useLoadingIndicator();

    const masterAccountService = useInjectable(MasterAccountService);

    const gameServantList = useGameServantList();

    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    const [parsedData, setParsedData] = useState<MasterServantParserResult>();
    const [importStatus, setImportStatus] = useState<ImportStatus>('none');
    const [importStatusDialogOpen, setImportStatusDialogOpen] = useState<boolean>(false);

    /*
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(setMasterAccount);

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    /*
     * Turns off the loading indicator if the parsed data has changed.
     */
    useEffect(() => {
        /*
         * Allow the loading indicator to spin for half more second before hiding it.
         */
        setTimeout(() => {
            resetLoadingIndicator();
        }, 500);
    }, [parsedData, resetLoadingIndicator]);

    /*
     * Automatically opens the dialog when the status changes to anything other
     * than `none`.
     */
    useEffect(() => {
        if (importStatus === 'none') {
            return;
        }
        setImportStatusDialogOpen(true);
    }, [importStatus]);

    const gameServantNameMap = useMemo((): ImmutableRecord<string, GameServant> | undefined => {
        if (!gameServantList) {
            return undefined;
        }
        const result: Record<string, Immutable<GameServant>> = {};
        for (const servant of gameServantList) {
            const name = servant.metadata.fgoManagerName;
            if (!name) {
                continue;
            }
            result[name] = servant;
        }
        return result;
    }, [gameServantList]);

    const parseData = useCallback((csvContents: string): void => {
        if (!gameServantNameMap) {
            return;
        }

        csvContents = csvContents.trim();
        if (!csvContents) {
            return setImportStatus('parseFail');
        }

        // Activate the loading indicator before parsing.
        invokeLoadingIndicator();

        // Set timeout to allow the loading indicator to be rendered first.
        setTimeout(async () => {
            const data: Array2D<string> = parse(csvContents, CsvParseOptions);
            const logger = new TransformLogger();
            const servantUpdates = FgoManagerParsers.parseRosterSheet(data, gameServantNameMap, logger);
            // TODO Redo this
            const parsedData: MasterServantParserResult = {
                servantUpdates,
                warnings: [],
                errors: []
            };
            if (!parsedData.servantUpdates.length) {
                setImportStatus('parseFail');
            } else {
                setImportStatus('parseSuccess');
                setParsedData(parsedData);
            }
            resetLoadingIndicator();
        });

    }, [gameServantNameMap, invokeLoadingIndicator, resetLoadingIndicator]);

    const cancelImport = useCallback((): void => {
        setParsedData(undefined);
        setImportStatus('none');
    }, []);

    const finalizeImport = useCallback(async (existingAction = ExistingAction.Overwrite): Promise<void> => {
        if (!masterAccount || !parsedData) {
            return;
        }
        invokeLoadingIndicator();

        const bondLevels = { ...masterAccount.bondLevels };
        /*
         * Existing bond levels are always merged with imported data, regardless of the
         * selected action.
         */
        for (const { gameId, bondLevel } of parsedData.servantUpdates) {
            if (bondLevel === undefined) {
                delete bondLevels[gameId];
            } else if (bondLevel !== IndeterminateValue) {
                bondLevels[gameId] = bondLevel;
            }
        }

        /**
         * The update payload.
         */
        const update: Partial<MasterAccount> = {
            _id: masterAccount._id,
            bondLevels
        };

        /*
         * Generate the servant update data depending on the selected action.
         */
        if (existingAction === ExistingAction.Update) {
            /*
             * Clone the existing servants, just in case the update fails.
             */
            const servants = masterAccount.servants.map(servant => MasterServantUtils.clone(servant));

            /*
             * Merge the parsed servants into the existing servants.
             */
            MasterServantUpdateUtils.batchApplyFromUpdateObjects(servants, parsedData.servantUpdates, bondLevels);

            update.servants = servants;
        } else {
            /*
             * The `instanceId` needs to continue off from the old list, for both the
             * `Append` and `Overwrite` actions.
             */
            let instanceId = MasterServantUtils.getLastInstanceId(masterAccount.servants) + 1;
            const masterServants = [] as Array<MasterServant>;
            for (const parsedUpdate of parsedData.servantUpdates) {
                const masterServant = MasterServantUpdateUtils.convertToMasterServant(instanceId++, parsedUpdate, bondLevels);
                masterServants.push(masterServant);
            }

            if (existingAction === ExistingAction.Append) {
                update.servants = [
                    ...masterAccount.servants,
                    ...masterServants
                ];
            } else {
                update.servants = masterServants;
            }
        }

        try {
            await masterAccountService.updateAccount(update);
            setImportStatus('importSuccess');
        } catch (error) {
            console.error(error);
            setImportStatus('importFail');
        }

        resetLoadingIndicator();
    }, [invokeLoadingIndicator, masterAccount, masterAccountService, parsedData, resetLoadingIndicator]);

    const handleImportStatusDialogAction = useCallback((): void => {
        switch (importStatus) {
            case 'importSuccess':
                return navigate('/user/master/servants');
            case 'parseFail':
            case 'importFail':
                setImportStatus('none');
                break;
            default:
            // Do nothing
        }
        setImportStatusDialogOpen(false);
    }, [navigate, importStatus]);

    const mainContentNode = useMemo((): ReactNode => {
        /*
         * If data has been successfully parsed, then show the parsed servant list.
         */
        if (parsedData && parsedData.servantUpdates.length) {
            return (
                <MasterServantImportList
                    parsedData={parsedData}
                    hasExistingServants={!!masterAccount?.servants.length}
                    onSubmit={finalizeImport}
                    onCancel={cancelImport}
                />
            );
        }
        /*
         * Otherwise, keep showing the file input.
         */
        return (
            <MasterServantImportFileInput
                onSubmit={parseData}
                disableSubmit={isLoadingIndicatorActive}
            />
        );
    }, [cancelImport, finalizeImport, isLoadingIndicatorActive, masterAccount?.servants.length, parseData, parsedData]);

    const importStatusDialog = useMemo((): ReactNode => {
        const message = ImportStatusMessages[importStatus];
        return (
            <AlertDialog
                open={importStatusDialogOpen}
                message={message}
                confirmButtonColor='primary'
                confirmButtonLabel='OK'
                onClose={handleImportStatusDialogAction}
            />
        );
    }, [handleImportStatusDialogAction, importStatus, importStatusDialogOpen]);

    return <>
        {mainContentNode}
        {importStatusDialog}
    </>;

});

export default MasterServantImportRoute;

import { Array2D, Immutable, Nullable, ReadonlyRecord } from '@fgo-planner/common-core';
import { InstantiatedServantUpdateIndeterminateValue as IndeterminateValue, MasterAccount, UpdateMasterAccount, MasterServant, MasterServantUpdateUtils, MasterServantUtils } from '@fgo-planner/data-core';
import { FgoManagerDataImport, MasterAccountImportData } from '@fgo-planner/transform-core';
import { Options } from 'csv-parse';
import { parse } from 'csv-parse/sync';
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertDialog } from '../../../../components/dialog/AlertDialog';
import { useFgoManagerNamesMap } from '../../../../hooks/data/useFgoManagerNamesMap';
import { useInjectable } from '../../../../hooks/dependency-injection/useInjectable';
import { useLoadingIndicator } from '../../../../hooks/user-interface/useLoadingIndicator';
import { MasterAccountService } from '../../../../services/data/master/MasterAccountService';
import { SubscribablesContainer } from '../../../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../../../utils/subscription/SubscriptionTopics';
import { MasterServantImportExistingAction as ExistingAction } from './MasterServantImportExistingAction.enum';
import { MasterServantImportRouteFileInput } from './components/MasterServantImportRouteFileInput';
import { MasterServantImportRouteServantList } from './components/MasterServantImportRouteServantList';

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

    const fgoManagerNamesMap = useFgoManagerNamesMap();

    const [masterAccount, setMasterAccount] = useState<Nullable<Immutable<MasterAccount>>>();
    const [parsedData, setParsedData] = useState<MasterAccountImportData>();
    const [importStatus, setImportStatus] = useState<ImportStatus>('none');
    const [importStatusDialogOpen, setImportStatusDialogOpen] = useState<boolean>(false);

    /**
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(setMasterAccount);

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    /**
     * Turns off the loading indicator if the parsed data has changed.
     */
    useEffect(() => {
        /**
         * Allow the loading indicator to spin for half more second before hiding it.
         */
        setTimeout(() => {
            resetLoadingIndicator();
        }, 500);
    }, [parsedData, resetLoadingIndicator]);

    /**
     * Automatically opens the dialog when the status changes to anything other
     * than `none`.
     */
    useEffect(() => {
        if (importStatus === 'none') {
            return;
        }
        setImportStatusDialogOpen(true);
    }, [importStatus]);

    const parseData = useCallback((csvContents: string): void => {
        if (!fgoManagerNamesMap) {
            return;
        }

        csvContents = csvContents.trim();
        if (!csvContents) {
            return setImportStatus('parseFail');
        }

        /**
         * Activate the loading indicator before parsing.
         */
        invokeLoadingIndicator();

        /**
         * Set timeout to allow the loading indicator to be rendered first.
         */
        setTimeout(async () => {
            const data: Array2D<string> = parse(csvContents, CsvParseOptions);
            const parsedData = FgoManagerDataImport.transformRosterSheetToMasterAccountImportData(data, fgoManagerNamesMap);
            if (!parsedData.servants?.length) {
                setImportStatus('parseFail');
            } else {
                setImportStatus('parseSuccess');
                setParsedData(parsedData);
            }
            resetLoadingIndicator();
        });

    }, [fgoManagerNamesMap, invokeLoadingIndicator, resetLoadingIndicator]);

    const cancelImport = useCallback((): void => {
        setParsedData(undefined);
        setImportStatus('none');
    }, []);

    const finalizeImport = useCallback(async (existingAction: ExistingAction = ExistingAction.Overwrite): Promise<void> => {
        if (!masterAccount || !parsedData?.servants) {
            return;
        }
        invokeLoadingIndicator();

        const currentServantsData = masterAccount.servants;

        const bondLevels = { ...currentServantsData.bondLevels };
        /**
         * Existing bond levels are always merged with imported data, regardless of the
         * selected action.
         */
        for (const { servantId, bondLevel } of parsedData.servants) {
            if (bondLevel == null) {
                delete bondLevels[servantId];
            } else if (bondLevel !== IndeterminateValue) {
                bondLevels[servantId] = bondLevel;
            }
        }

        /**
         * The update payload.
         */
        const update: UpdateMasterAccount = {
            _id: masterAccount._id,
        };

        const startInstanceId = currentServantsData.lastServantInstanceId + 1;
        /**
         * Generate the servant update data depending on the selected action.
         */
        if (existingAction === ExistingAction.Update) {
            /**
             * Clone the existing servants, just in case the update fails.
             */
            /** */
            const servants = currentServantsData.servants.map(servant => MasterServantUtils.clone(servant));
            /**
             * Merge the parsed servants into the existing servants.
             */
            /** */
            const lastServantInstanceId = MasterServantUpdateUtils.batchApplyToMasterServants(
                parsedData.servants,
                servants,
                startInstanceId,
                bondLevels
            );

            update.servants = {
                servants,
                lastServantInstanceId,
                bondLevels
            };

        } else {
            let instanceId = startInstanceId;
            const masterServants = [] as Array<MasterServant>;
            for (const parsedUpdate of parsedData.servants) {
                const masterServant = MasterServantUpdateUtils.toMasterServant(instanceId++, parsedUpdate, bondLevels);
                masterServants.push(masterServant);
            }

            let servants;
            if (existingAction === ExistingAction.Append) {
                servants = [
                    ...currentServantsData.servants,
                    ...masterServants
                ];
            } else {
                servants = masterServants;
            }

            update.servants = {
                servants,
                lastServantInstanceId: instanceId,
                bondLevels
            };
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
        /**
         * If data has been successfully parsed, then show the parsed servant list.
         */
        if (parsedData?.servants?.length) {
            return (
                <MasterServantImportRouteServantList
                    parsedServants={parsedData.servants}
                    hasExistingServants={!!masterAccount?.servants.servants.length}
                    onSubmit={finalizeImport}
                    onCancel={cancelImport}
                />
            );
        }
        /**
         * Otherwise, keep showing the file input.
         */
        return (
            <MasterServantImportRouteFileInput
                onSubmit={parseData}
                disableSubmit={isLoadingIndicatorActive}
            />
        );
    }, [cancelImport, finalizeImport, isLoadingIndicatorActive, masterAccount, parseData, parsedData]);

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

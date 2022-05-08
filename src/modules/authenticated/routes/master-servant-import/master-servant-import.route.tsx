import { MasterAccount } from '@fgo-planner/types';
import React, { Fragment, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertDialog } from '../../../../components/dialog/alert-dialog.component';
import { LayoutPageScrollable } from '../../../../components/layout/layout-page-scrollable.component';
import { useGameServantList } from '../../../../hooks/data/use-game-servant-list.hook';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useElevateAppBarOnScroll } from '../../../../hooks/user-interface/use-elevate-app-bar-on-scroll.hook';
import { useLoadingIndicator } from '../../../../hooks/user-interface/use-loading-indicator.hook';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { FgoManagerMasterServantParser } from '../../../../services/import/fgo-manager/fgo-manager-master-servant-parser';
import { MasterServantParserResult } from '../../../../services/import/master-servant-parser-result.type';
import { Nullable, ReadonlyRecord } from '../../../../types/internal';
import { MasterServantUtils } from '../../../../utils/master/master-servant.utils';
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

// TODO Split into smaller components
const MasterServantImportRoute = React.memo(() => {

    const navigate = useNavigate();

    const {
        invokeLoadingIndicator,
        resetLoadingIndicator,
        isLoadingIndicatorActive
    } = useLoadingIndicator();

    const scrollContainerRef = useElevateAppBarOnScroll();

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

    const parseData = useCallback((data: string): void => {
        data = data.trim();
        if (!data) {
            return setImportStatus('parseFail');
        }

        // Activate the loading indicator before parsing.
        invokeLoadingIndicator();

        // Set timeout to allow the loading indicator to be rendered first.
        setTimeout(async () => {
            const parser = new FgoManagerMasterServantParser(data, gameServantList || []);
            const parsedData = parser.parse();
            if (!parsedData.masterServants.length) {
                setImportStatus('parseFail');
            } else {
                setImportStatus('parseSuccess');
                setParsedData(parsedData);
            }
            resetLoadingIndicator();
        });

    }, [gameServantList, invokeLoadingIndicator, resetLoadingIndicator]);

    const cancelImport = useCallback((): void => {
        setParsedData(undefined);
        setImportStatus('none');
    }, []);

    const finalizeImport = useCallback(async (existingAction = ExistingAction.Overwrite): Promise<void> => {
        if (!masterAccount || !parsedData) {
            return;
        }
        invokeLoadingIndicator();

        /**
         * The update payload.
         */
        const update: Partial<MasterAccount> = {
            _id: masterAccount._id,
            /*
             * Existing bond levels are always merged with imported data, regardless of the
             * selected action.
             */
            bondLevels: {
                ...masterAccount.bondLevels,
                ...parsedData.bondLevels
            }
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
            MasterServantUtils.merge(servants, parsedData.masterServants);

            update.servants = servants;
        } else {
            /*
             * Update `instanceId` to continue off from the old list. This needs to be done
             * for both the `Append` and `Overwrite` actions.
             */
            const lastInstanceId = MasterServantUtils.getLastInstanceId(masterAccount.servants);
            MasterServantUtils.reassignInstanceIds(parsedData.masterServants, lastInstanceId + 1);

            if (existingAction === ExistingAction.Append) {
                update.servants = [
                    ...masterAccount.servants,
                    ...parsedData.masterServants
                ];
            } else {
                update.servants = parsedData.masterServants;
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
        if (parsedData && parsedData.masterServants.length) {
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

    return (
        <Fragment>
            <LayoutPageScrollable scrollContainerRef={scrollContainerRef}>
                {mainContentNode}
            </LayoutPageScrollable>
            {importStatusDialog}
        </Fragment>
    );

});

export default MasterServantImportRoute;

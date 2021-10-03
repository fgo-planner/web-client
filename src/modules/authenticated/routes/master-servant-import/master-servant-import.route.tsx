import { MasterAccount, MasterServant } from '@fgo-planner/types';
import { Button, Fab, Theme, Tooltip } from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import { Clear as ClearIcon, Done as DoneIcon, Publish as PublishIcon } from '@mui/icons-material';
import React, { Fragment, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DropzoneRef } from 'react-dropzone';
import { useHistory } from 'react-router-dom';
import { AlertDialog } from '../../../../components/dialog/alert-dialog.component';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { FileInputWithTextarea } from '../../../../components/input/file-input-with-textarea.component';
import { LayoutPageScrollable } from '../../../../components/layout/layout-page-scrollable.component';
import { LayoutPanelContainer } from '../../../../components/layout/layout-panel-container.component';
import { useElevateAppBarOnScroll } from '../../../../hooks/user-interface/use-elevate-app-bar-on-scroll.hook';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { GameServantService } from '../../../../services/data/game/game-servant.service';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { FgoManagerMasterServantParser } from '../../../../services/import/fgo-manager/fgo-manager-master-servant-parser';
import { MasterServantParserResult } from '../../../../services/import/master-servant-parser-result.type';
import { LoadingIndicatorOverlayService } from '../../../../services/user-interface/loading-indicator-overlay.service';
import { ModalOnCloseReason, Nullable } from '../../../../types/internal';
import { MasterServantUtils } from '../../../../utils/master/master-servant.utils';
import { MasterServantListVisibleColumns } from '../../components/master/servant/list/master-servant-list-columns';
import { MasterServantListHeader } from '../../components/master/servant/list/master-servant-list-header.component';
import { MasterServantList } from '../../components/master/servant/list/master-servant-list.component';
import { MasterServantImportConfirmationDialog } from './master-servant-import-confirmation-dialog.component';

const FileInputHelperText = 'To import the servant data from FGO Manager, download the \'Roster\' sheet as a .csv file and upload it here.';

const FileInputActionsHelperText = 'Select or drag and drop the .csv file here, or paste the file contents above';

const ParseFailMessage = 'No servants could be parsed from the given data! Please review the data and try again.';

const ParseResultHelperText = `The following servants were parsed from the given data. They have NOT been imported yet. Please review the
    list and click on the confirm button to finalize the import.`;

const ImportSuccessMessage = 'Servants imported successfully!';

const ImportFailMessage = 'An error was encountered while attempting to import servants.';

// TODO Make this responsive.
const ServantListVisibleColumns: MasterServantListVisibleColumns = {
    npLevel: true,
    level: true,
    bondLevel: true,
    fouHp: true,
    fouAtk: true,
    skillLevels: true,
    actions: false
};

const style = (theme: Theme) => ({
    fileInputHelperText: {
        color: theme.palette.text.secondary,
        padding: theme.spacing(6, 8, 0, 8)
    },
    fileInputContainer: {
        padding: theme.spacing(4)
    },
    fileInputActions: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingTop: theme.spacing(4)
    },
    fileInputActionsHelperText: {
        color: theme.palette.text.secondary,
        paddingRight: theme.spacing(4)
    },
    importResultsHelperText: {
        color: theme.palette.text.secondary,
        minWidth: `${theme.breakpoints.values.lg}px`,
        padding: theme.spacing(6, 4, 4, 4)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantImport'
};

const useStyles = makeStyles(style, styleOptions);

const MasterServantImportRoute = React.memo(() => {

    const forceUpdate = useForceUpdate();

    const classes = useStyles();
    const history = useHistory();

    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    const [importData, setImportData] = useState<string>();
    const [parsedData, setParsedData] = useState<MasterServantParserResult>();
    const [showConfirmationDialog, setShowConfirmationDialog] = useState<boolean>(false);
    const [importStatus, setImportStatus] = useState<'none' | 'fail' | 'success'>('none');

    const loadingIndicatorIdRef = useRef<string>();
    const dropzoneRef = useRef<DropzoneRef | null>(null);
    const scrollContainerRef = useElevateAppBarOnScroll();

    const resetLoadingIndicator = useCallback((): void => {
        const loadingIndicatorId = loadingIndicatorIdRef.current;
        if (loadingIndicatorId) {
            LoadingIndicatorOverlayService.waive(loadingIndicatorId);
            loadingIndicatorIdRef.current = undefined;
            forceUpdate();
        }
    }, [forceUpdate]);

    /**
     * onCurrentMasterAccountChange subscriptions
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = MasterAccountService.onCurrentMasterAccountChange
            .subscribe(setMasterAccount);

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    /**
     * onCurrentMasterAccountUpdated subscriptions
     */
    useEffect(() => {
        const onCurrentMasterAccountUpdatedSubscription = MasterAccountService.onCurrentMasterAccountUpdated
            .subscribe(account => {
                if (account == null) {
                    return;
                }
                setMasterAccount(account);
            });

        return () => onCurrentMasterAccountUpdatedSubscription.unsubscribe();
    }, [resetLoadingIndicator]);

    /**
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

    const openFileUploadDialog = useCallback((): void => {
        // Note that the ref is set async, so it might be null at some point.
        dropzoneRef.current?.open();
    }, []);

    const hasImportData = !!importData?.trim().length;

    const parseImportData = useCallback((): void => {
        if (!hasImportData) {
            console.error('No data');
            return;
        }

        // Activate the loading indicator before parsing.
        loadingIndicatorIdRef.current = LoadingIndicatorOverlayService.invoke();
        forceUpdate();

        let lastInstanceId = -1;
        if (masterAccount) {
            lastInstanceId = MasterServantUtils.getLastInstanceId(masterAccount.servants);
        }

        // Set timeout to allow the loading indicator to be rendered first.
        setTimeout(async () => {
            const gameServants = await GameServantService.getServants();
            const parser = new FgoManagerMasterServantParser(importData!!, gameServants);
            const parsedData = parser.parse(lastInstanceId + 1);
            setImportData('');
            setParsedData(parsedData);
        });
    }, [forceUpdate, hasImportData, importData, masterAccount]);

    const cancelImport = useCallback((): void => {
        setParsedData(undefined);
    }, []);

    const finalizeImport = useCallback(async (overwrite = false): Promise<void> => {
        if (!masterAccount || !parsedData) {
            return;
        }

        loadingIndicatorIdRef.current = LoadingIndicatorOverlayService.invoke();
        forceUpdate();

        let servants: MasterServant[];
        if (overwrite) {
            // Overwrite
            servants = parsedData.masterServants;
        } else {
            // Append
            servants = [
                ...masterAccount.servants,
                ...parsedData.masterServants
            ];
        }

        /*
         * Combine existing and imported bond level data. The imported data
         * will always overwrite the existing data.
         */
        const bondLevels = {
            ...masterAccount.bondLevels,
            ...parsedData.bondLevels
        };

        try {
            await MasterAccountService.updateAccount({
                _id: masterAccount._id,
                servants,
                bondLevels
            });
            setImportStatus('success');
        } catch (error) {
            console.error(error);
            setImportStatus('fail');
        }

        resetLoadingIndicator();
    }, [forceUpdate, masterAccount, parsedData, resetLoadingIndicator]);

    const handleFinalizeImportClick = useCallback((): void => {
        if (!masterAccount) {
            return;
        }
        /*
         * If there are already servants in the account, then prompt the user for an
         * action.
         */
        if (masterAccount.servants.length) {
            return setShowConfirmationDialog(true);
        }
        /*
         * Otherwise, just import the servants.
         */
        finalizeImport();
    }, [finalizeImport, masterAccount]);

    const handleConfirmationDialogAction = useCallback((event: any, reason: ModalOnCloseReason, overwrite?: boolean): void => {
        setShowConfirmationDialog(false);
        if (reason === 'submit') {
            finalizeImport(overwrite);
        }
    }, [finalizeImport]);

    const handleImportStatusDialogAction = useCallback((): void => {
        if (importStatus === 'success') {
            return history.push('/user/master/servants');
        } else if (importStatus === 'fail') {
            setImportStatus('none');
        }
    }, [history, importStatus]);

    const fabContainerChildNodes: ReactNode = useMemo(() => {
        if (!parsedData) {
            const disabled = !hasImportData || !!loadingIndicatorIdRef.current;
            return (
                <Tooltip title="Import data">
                    <div>
                        <Fab
                            color="primary"
                            onClick={parseImportData}
                            disabled={disabled}
                            children={<PublishIcon />}
                        />
                    </div>
                </Tooltip>
            );
        }
        return [
            <Tooltip key="cancel" title="Cancel">
                <div>
                    <Fab
                        color="default"
                        onClick={cancelImport}
                        children={<ClearIcon />}
                    />
                </div>
            </Tooltip>,
            <Tooltip key="submit" title="Confirm">
                <div>
                    <Fab
                        color="primary"
                        onClick={handleFinalizeImportClick}
                        children={<DoneIcon />}
                    />
                </div>
            </Tooltip>
        ];
    }, [cancelImport, handleFinalizeImportClick, hasImportData, parseImportData, parsedData]);

    const mainContentNode: ReactNode = useMemo(() => {
        /*
         * If there is no parsed data, display the data input screen.
         */
        if (!parsedData) {
            return (
                <Fragment>
                    <div className={classes.fileInputHelperText}>
                        {FileInputHelperText}
                    </div>
                    <div className={classes.fileInputContainer}>
                        <FileInputWithTextarea
                            dropzoneRef={dropzoneRef}
                            rows={15}
                            value={importData}
                            onValueChange={setImportData}
                        >
                            <div className={classes.fileInputActions}>
                                <div className={classes.fileInputActionsHelperText}>
                                    {FileInputActionsHelperText}
                                </div>
                                <Button variant="contained" color="secondary" onClick={openFileUploadDialog}>
                                    Select File
                                </Button>
                            </div>
                        </FileInputWithTextarea>
                    </div>
                </Fragment>
            );
        }
        /*
         * Else, display the parsed servant results.
         */
        const { masterServants, bondLevels } = parsedData;
        // TODO Display errors and warning
        if (!masterServants.length) {
            return (
                <AlertDialog
                    open
                    message={ParseFailMessage}
                    confirmButtonColor="primary"
                    confirmButtonLabel="OK"
                    onClose={cancelImport}
                />
            );
        }
        return (
            <Fragment>
                <div className={classes.importResultsHelperText}>
                    {ParseResultHelperText}
                </div>
                <LayoutPanelContainer className="p-4">
                    <MasterServantListHeader
                        visibleColumns={ServantListVisibleColumns}
                    />
                    <MasterServantList
                        openLinksInNewTab
                        masterServants={masterServants}
                        bondLevels={bondLevels}
                        visibleColumns={ServantListVisibleColumns}
                    />
                </LayoutPanelContainer>
                <div className="py-10" />
            </Fragment>
        );
    }, [cancelImport, classes, importData, openFileUploadDialog, parsedData]);

    return (
        <Fragment>
            <LayoutPageScrollable scrollContainerRef={scrollContainerRef}>
                {mainContentNode}
            </LayoutPageScrollable>
            <FabContainer children={fabContainerChildNodes} />
            <MasterServantImportConfirmationDialog
                open={showConfirmationDialog}
                confirmButtonColor="primary"
                onClose={handleConfirmationDialogAction}
            />
            <AlertDialog
                open={importStatus !== 'none'}
                message={importStatus === 'success' ? ImportSuccessMessage : ImportFailMessage}
                confirmButtonColor="primary"
                confirmButtonLabel="OK"
                onClose={handleImportStatusDialogAction}
            />
        </Fragment>
    );

});

export default MasterServantImportRoute;

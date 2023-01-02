import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, useCallback, useState } from 'react';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { ModalOnCloseReason } from '../../../../types';
import { RouteDataEditControls } from '../../components/control/RouteDataEditControls';
import { RouteDataEditReloadOnStaleDataDialog } from '../../components/control/RouteDataEditReloadOnStaleDataDialog';
import { RouteDataEditSaveOnStaleDataDialog } from '../../components/control/RouteDataEditSaveOnStaleDataDialog';
import { MasterAccountDataEditHookOptions, useMasterAccountDataEdit } from '../../hooks/useMasterAccountDataEdit';
import { MasterServantCostumesList } from './master-servant-costumes-list.component';

const MasterAccountDataEditOptions = {
    includeCostumes: true
} as const satisfies MasterAccountDataEditHookOptions;

const StyleClassPrefix = 'MasterCostumes';

const StyleProps = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    [`& .${StyleClassPrefix}-main-content`]: {
        display: 'flex',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        [`& .${StyleClassPrefix}-list-container`]: {
            flex: 1,
            overflow: 'hidden'
        }
    }
} as SystemStyleObject<SystemTheme>;

export const MasterServantCostumesRoute = React.memo(() => {

    const {
        awaitingRequest,
        isDataDirty,
        isDataStale,
        masterAccountEditData,
        updateCostumes,
        reloadData,
        revertChanges,
        persistChanges
    } = useMasterAccountDataEdit(MasterAccountDataEditOptions);

    // TODO Move these to a dialog state hook.
    const [reloadDialogOpen, setReloadDialogOpen] = useState<boolean>(false);
    const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);

    const handleCostumeChange = useCallback((costumeId: number, unlocked: boolean): void => {
        let updatedCostumes: Array<number>;
        if (unlocked) {
            updatedCostumes = [...masterAccountEditData.costumes, costumeId];
        } else {
            updatedCostumes = [...masterAccountEditData.costumes].filter(id => id !== costumeId);
        }
        updateCostumes(updatedCostumes);
    }, [masterAccountEditData, updateCostumes]);

    const saveData = useCallback(async (): Promise<void> => {
        try {
            persistChanges();
        } catch (error: any) {
            // TODO Display error message to user.
            console.error(error);
        }
    }, [persistChanges]);

    const handleSaveButtonClick = useCallback((_event: MouseEvent): void => {
        if (isDataStale) {
            setSaveDialogOpen(true);
        } else {
            saveData();
        }
    }, [isDataStale, saveData]);

    const handleReloadButtonClick = useCallback((_event: MouseEvent): void => {
        setReloadDialogOpen(true);
    }, []);

    const handleRevertButtonClick = useCallback((_event: MouseEvent): void => {
        revertChanges();
    }, [revertChanges]);

    const handleReloadDataDialogClose = useCallback((_event: MouseEvent, reason: ModalOnCloseReason): void => {
        if (reason === 'submit') {
            reloadData();
        }
        setReloadDialogOpen(false);
    }, [reloadData]);

    const handleSaveDataDialogClose = useCallback((_event: MouseEvent, reason: ModalOnCloseReason): void => {
        if (reason === 'submit') {
            saveData();
        }
        setSaveDialogOpen(false);
    }, [saveData]);

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <RouteDataEditControls
                disabled={awaitingRequest}
                isDataDirty={isDataDirty}
                isDataStale={isDataStale}
                title='Unlocked Costumes'
                onReloadButtonClick={handleReloadButtonClick}
                onRevertButtonClick={handleRevertButtonClick}
                onSaveButtonClick={handleSaveButtonClick}
            />
            <div className={`${StyleClassPrefix}-main-content`}>
                <div className={clsx(`${StyleClassPrefix}-list-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                    <MasterServantCostumesList
                        unlockedCostumes={masterAccountEditData.costumes}
                        onChange={handleCostumeChange}
                    />
                </div>
            </div>
            <RouteDataEditReloadOnStaleDataDialog
                open={reloadDialogOpen}
                onClose={handleReloadDataDialogClose}
            />
            <RouteDataEditSaveOnStaleDataDialog
                open={saveDialogOpen}
                onClose={handleSaveDataDialogClose}
            />
        </Box>
    );

});

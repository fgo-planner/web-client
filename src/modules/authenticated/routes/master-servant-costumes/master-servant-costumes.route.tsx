import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { useCallback, useState } from 'react';
import { RouteDataEditControls } from '../../../../components/control/route-data-edit-controls.component';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { useMasterAccountDataEditHook } from '../../hooks/use-master-account-data-edit.hook';
import { MasterServantCostumesList } from './master-servant-costumes-list.component';

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
        isDataDirty,
        masterAccountEditData,
        updateCostumes,
        revertChanges,
        persistChanges
    } = useMasterAccountDataEditHook({ includeCostumes: true });

    const [awaitingRequest, setAwaitingRequest] = useState<boolean>(false);

    const handleCostumeChange = useCallback((costumeId: number, unlocked: boolean): void => {
        let updatedCostumes: Array<number>;
        if (unlocked) {
            updatedCostumes = [...masterAccountEditData.costumes, costumeId];
        } else {
            updatedCostumes = [...masterAccountEditData.costumes].filter(id => id !== costumeId);
        }
        updateCostumes(updatedCostumes);
    }, [masterAccountEditData, updateCostumes]);

    const handleSaveButtonClick = useCallback(async (): Promise<void> => {
        setAwaitingRequest(true);
        try {
            await persistChanges();
            setAwaitingRequest(false);
        } catch (error: any) {
            // TODO Display error message to user.
            console.error(error);
            setAwaitingRequest(false);
            revertChanges();
        }
    }, [persistChanges, revertChanges]);

    const handleRevertButtonClick = useCallback((): void => {
        revertChanges();
    }, [revertChanges]);

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <RouteDataEditControls
                title='Unlocked Costumes'
                hasUnsavedData={isDataDirty}
                onSaveButtonClick={handleSaveButtonClick}
                onRevertButtonClick={handleRevertButtonClick}
                disabled={awaitingRequest}
            />
            <div className={`${StyleClassPrefix}-main-content`}>
                <div className={clsx(`${StyleClassPrefix}-list-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                    <MasterServantCostumesList
                        unlockedCostumes={masterAccountEditData.costumes}
                        onChange={handleCostumeChange}
                    />
                </div>
            </div>
        </Box>
    );

});

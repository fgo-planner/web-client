import { Icon, IconButton, Theme, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { NavigationRail } from '../../../../components/navigation/navigation-rail/NavigationRail';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/use-active-breakpoints.hook';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { ModalOnCloseReason } from '../../../../types';
import { RouteDataEditControls } from '../../components/control/RouteDataEditControls';
import { RouteDataEditReloadOnStaleDataDialog } from '../../components/control/RouteDataEditReloadOnStaleDataDialog';
import { RouteDataEditSaveOnStaleDataDialog } from '../../components/control/RouteDataEditSaveOnStaleDataDialog';
import { MasterAccountDataEditHookOptions, useMasterAccountDataEdit } from '../../hooks/useMasterAccountDataEdit';
import { MasterItemList } from './master-item-list.component';

const MasterAccountDataEditOptions = {
    includeItems: true
} as const satisfies MasterAccountDataEditHookOptions;

const StyleClassPrefix = 'MasterItems';

const StyleProps = (theme: SystemTheme) => {

    const {
        breakpoints,
        palette,
        spacing
    } = theme as Theme;

    return {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        [`& .${StyleClassPrefix}-lower-layout-container`]: {
            display: 'flex',
            height: '100%',
            overflow: 'hidden',
            [`& .${StyleClassPrefix}-main-content`]: {
                display: 'flex',
                width: `calc(100% - ${spacing(ThemeConstants.NavigationRailSizeScale)})`,
                [`& .${StyleClassPrefix}-list-container`]: {
                    flex: 1,
                    overflow: 'hidden',
                    backgroundColor: palette.background.paper
                }
            },
            [breakpoints.down('sm')]: {
                flexDirection: 'column',
                [`& .${StyleClassPrefix}-main-content`]: {
                    width: '100%',
                    height: `calc(100% - ${spacing(ThemeConstants.NavigationRailSizeScale)})`
                }
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterItemsRoute = React.memo(() => {

    const {
        awaitingRequest,
        isDataDirty,
        isDataStale,
        masterAccountEditData,
        updateItem,
        reloadData,
        revertChanges,
        persistChanges
    } = useMasterAccountDataEdit(MasterAccountDataEditOptions);

    // TODO Move these to a dialog state hook.
    const [reloadDialogOpen, setReloadDialogOpen] = useState<boolean>(false);
    const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);

    const { sm } = useActiveBreakpoints();

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

    /**
     * NavigationRail children
     */
    const navigationRailChildNodes = [
        <Tooltip key='stats' title='Item stats' placement='right'>
            <div>
                <IconButton
                    component={Link}
                    to='stats'
                    children={<Icon>equalizer</Icon>}
                    size='large'
                />
            </div>
        </Tooltip>,
        <Tooltip key='import' title='Upload item data' placement='right'>
            <div>
                {/* TODO Implement this */}
                <IconButton
                    children={<Icon>publish</Icon>}
                    disabled
                    size='large'
                />
            </div>
        </Tooltip>,
        <Tooltip key='export' title='Download item data' placement='right'>
            <div>
                {/* TODO Implement this */}
                <IconButton
                    children={<Icon>get_app</Icon>}
                    size='large'
                    disabled
                />
            </div>
        </Tooltip>
    ];

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <RouteDataEditControls
                disabled={awaitingRequest}
                isDataDirty={isDataDirty}
                isDataStale={isDataStale}
                title='Item Inventory'
                onReloadButtonClick={handleReloadButtonClick}
                onRevertButtonClick={handleRevertButtonClick}
                onSaveButtonClick={handleSaveButtonClick}
            />
            <div className={`${StyleClassPrefix}-lower-layout-container`}>
                <NavigationRail
                    border
                    layout={sm ? 'column' : 'row'}
                >
                    {navigationRailChildNodes}
                </NavigationRail>
                <div className={`${StyleClassPrefix}-main-content`}>
                    <div className={clsx(`${StyleClassPrefix}-list-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                        <MasterItemList
                            showQuantityHeaderLabel
                            itemQuantities={masterAccountEditData.items}
                            qp={masterAccountEditData.qp}
                            onChange={updateItem}
                        />
                    </div>
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

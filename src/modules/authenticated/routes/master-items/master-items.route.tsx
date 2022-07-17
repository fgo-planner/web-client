import { Equalizer as EqualizerIcon, GetApp, Publish as PublishIcon } from '@mui/icons-material';
import { Box, IconButton, Theme, Tooltip } from '@mui/material';
import { SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { RouteDataEditControls } from '../../../../components/control/route-data-edit-controls.component';
import { NavigationRail } from '../../../../components/navigation/navigation-rail/navigation-rail.component';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/use-active-breakpoints.hook';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { useMasterAccountDataEditHook } from '../../hooks/use-master-account-data-edit.hook';
import { MasterItemList } from './master-item-list.component';

const StyleClassPrefix = 'MasterItems';

const StyleProps = (theme: SystemTheme) => {

    const {
        breakpoints,
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
                    overflow: 'hidden'
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
        isDataDirty,
        masterAccountEditData,
        updateItem,
        revertChanges,
        persistChanges
    } = useMasterAccountDataEditHook({ includeItems: true });

    const [awaitingRequest, setAwaitingRequest] = useState<boolean>(false);

    const { sm } = useActiveBreakpoints();

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

    /**
     * NavigationRail children
     */
    const navigationRailChildNodes = [
        <Tooltip key='stats' title='Item stats' placement='right'>
            <div>
                <IconButton
                    component={Link}
                    to='stats'
                    children={<EqualizerIcon />}
                    size='large' />
            </div>
        </Tooltip>,
        <Tooltip key='import' title='Upload item data' placement='right'>
            <div>
                {/* TODO Implement this */}
                <IconButton children={<PublishIcon />} disabled size='large' />
            </div>
        </Tooltip>,
        <Tooltip key='export' title='Download item data' placement='right'>
            <div>
                {/* TODO Implement this */}
                <IconButton children={<GetApp />} disabled size='large' />
            </div>
        </Tooltip>
    ];

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <RouteDataEditControls
                title='Item Inventory'
                hasUnsavedData={isDataDirty}
                onSaveButtonClick={handleSaveButtonClick}
                onRevertButtonClick={handleRevertButtonClick}
                disabled={awaitingRequest}
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
                            itemQuantities={masterAccountEditData.items}
                            qp={masterAccountEditData.qp}
                            onChange={updateItem}
                        />
                    </div>
                </div>
            </div>
        </Box>
    );

});

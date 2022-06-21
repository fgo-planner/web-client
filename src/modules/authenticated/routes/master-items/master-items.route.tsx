import { Equalizer as EqualizerIcon, GetApp, Publish as PublishIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { RouteDataEditControls } from '../../../../components/control/route-data-edit-controls.component';
import { LayoutContentSection } from '../../../../components/layout/layout-content-section.component';
import { NavigationRail } from '../../../../components/navigation/navigation-rail/navigation-rail.component';
import { useMasterAccountDataEditHook } from '../../hooks/use-master-account-data-edit.hook';
import { MasterItemList } from './master-item-list.component';

export const MasterItemsRoute = React.memo(() => {

    const {
        isDataDirty,
        masterAccountEditData,
        updateItem,
        revertChanges,
        persistChanges
    } = useMasterAccountDataEditHook({ includeItems: true });

    const [awaitingRequest, setAwaitingRequest] = useState<boolean>(false);

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
        <div className='flex column full-height'>
            <RouteDataEditControls
                title='Item Inventory'
                hasUnsavedData={isDataDirty}
                onSaveButtonClick={handleSaveButtonClick}
                onRevertButtonClick={handleRevertButtonClick}
                disabled={awaitingRequest}
            />
            <div className='flex overflow-hidden'>
                <NavigationRail>
                    {navigationRailChildNodes}
                </NavigationRail>
                <LayoutContentSection
                    className='py-4 pr-4 flex-fill'
                    fullHeight
                    scrollbarTrackBorder
                >
                    <div className='flex column full-height overflow-auto'>
                        <MasterItemList
                            itemQuantities={masterAccountEditData.items}
                            qp={masterAccountEditData.qp}
                            onChange={updateItem}
                        />
                    </div>
                </LayoutContentSection>
            </div>
        </div>
    );

});

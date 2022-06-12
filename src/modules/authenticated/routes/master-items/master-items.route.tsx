import { Clear as ClearIcon, Edit as EditIcon, Equalizer as EqualizerIcon, GetApp, Publish as PublishIcon, Save as SaveIcon } from '@mui/icons-material';
import { Fab, IconButton, Tooltip } from '@mui/material';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { LayoutContentSection } from '../../../../components/layout/layout-content-section.component';
import { NavigationRail } from '../../../../components/navigation/navigation-rail/navigation-rail.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { useMasterAccountDataEditHook } from '../../hooks/use-master-account-data-edit.hook';
import { MasterItemList } from './master-item-list.component';

export const MasterItemsRoute = React.memo(() => {

    const {
        masterAccountEditData,
        updateItem,
        revertChanges,
        persistChanges
    } = useMasterAccountDataEditHook({ includeItems: true });

    const [editMode, setEditMode] = useState<boolean>(false);
    const [awaitingRequest, setAwaitingRequest] = useState<boolean>(false);

    /*
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(() => setEditMode(false));

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    const handleEditButtonClick = useCallback((): void => {
        setEditMode(true);
    }, []);

    const handleSaveButtonClick = useCallback(async (): Promise<void> => {
        setAwaitingRequest(true);
        try {
            await persistChanges();
            setAwaitingRequest(false);
            setEditMode(false);
        } catch (error: any) {
            // TODO Display error message to user.
            console.error(error);
            setAwaitingRequest(false);
            setEditMode(false);
            revertChanges();
        }
    }, [persistChanges, revertChanges]);

    const handleCancelButtonClick = useCallback((): void => {
        revertChanges();
        setEditMode(false);
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

    /**
     * FabContainer children
     */
    let fabContainerChildNodes: ReactNode;
    if (!editMode) {
        fabContainerChildNodes = (
            <Tooltip key='edit' title='Edit'>
                <div>
                    <Fab
                        color='primary'
                        onClick={handleEditButtonClick}
                        disabled={awaitingRequest}
                        children={<EditIcon />}
                    />
                </div>
            </Tooltip>
        );
    } else {
        fabContainerChildNodes = [
            <Tooltip key='cancel' title='Cancel'>
                <div>
                    <Fab
                        color='default'
                        onClick={handleCancelButtonClick}
                        disabled={awaitingRequest}
                        children={<ClearIcon />}
                    />
                </div>
            </Tooltip>,
            <Tooltip key='save' title='Save'>
                <div>
                    <Fab
                        color='primary'
                        onClick={handleSaveButtonClick}
                        disabled={awaitingRequest}
                        children={<SaveIcon />}
                    />
                </div>
            </Tooltip>
        ];
    }

    return (
        <div className='flex column full-height'>
            <PageTitle>
                {editMode ?
                    'Edit Item Inventory' :
                    'Item Inventory'
                }
            </PageTitle>
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
                            editMode={editMode}
                        />
                    </div>
                </LayoutContentSection>
            </div>
            <FabContainer children={fabContainerChildNodes} />
        </div>
    );

});

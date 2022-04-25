import { GameItemQuantity, MasterAccount } from '@fgo-planner/types';
import { Clear as ClearIcon, Edit as EditIcon, Equalizer as EqualizerIcon, GetApp, Publish as PublishIcon, Save as SaveIcon } from '@mui/icons-material';
import { Fab, IconButton, Tooltip } from '@mui/material';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { LayoutPanelScrollable } from '../../../../components/layout/layout-panel-scrollable.component';
import { NavigationRail } from '../../../../components/navigation/navigation-rail.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { GameItemConstants } from '../../../../constants';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useLoadingIndicator } from '../../../../hooks/user-interface/use-loading-indicator.hook';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { Immutable, Nullable } from '../../../../types/internal';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { MasterItemList } from './master-item-list.component';

const cloneItemsFromMasterAccount = (account: Nullable<Immutable<MasterAccount>>): Array<GameItemQuantity> => {
    if (!account) {
        return [];
    }
    const { resources } = account;
    const masterItems: GameItemQuantity[] = [];
    for (const masterItem of resources.items) {
        masterItems.push({ ...masterItem });
    }
    /*
     * Also push QP amount as part of the master items list. This will be removed
     * later when the list is saved.
     */
    masterItems.push({
        itemId: GameItemConstants.QpItemId,
        quantity: resources.qp
    });
    return masterItems;
};

export const MasterItemsRoute = React.memo(() => {

    const {
        invokeLoadingIndicator,
        resetLoadingIndicator,
        isLoadingIndicatorActive
    } = useLoadingIndicator();

    const masterAccountService = useInjectable(MasterAccountService);

    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    /**
     * Clone of the `items` array from the `MasterAccount` object.
     */
    const [masterItems, setMasterItems] = useState<Array<GameItemQuantity>>([]);
    const [editMode, setEditMode] = useState<boolean>(false);

    /*
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(account => {
                const masterItems = cloneItemsFromMasterAccount(account);
                setMasterAccount(account);
                setMasterItems(masterItems);
                setEditMode(false);
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    const handleEditButtonClick = useCallback((): void => {
        setEditMode(true);
    }, []);

    const handleSaveButtonClick = useCallback(async (): Promise<void> => {
        if (!masterAccount) {
            return;
        }
        invokeLoadingIndicator();

        /*
         * QP is stored as a standalone property in the `MasterAccount.resources`
         * object, so it needs to be separated out of the items list.
         */
        const qpItem = masterItems.find(item => item.itemId === GameItemConstants.QpItemId);
        const items = masterItems.filter(item => item.itemId !== GameItemConstants.QpItemId);

        const update = {
            _id: masterAccount._id,
            resources: {
                ...masterAccount.resources,
                items,
                qp: qpItem?.quantity || 0
            }
        };
        try {
            await masterAccountService.updateAccount(update);
        } catch (error: any) {
            // TODO Display error message to user.
            console.error(error);
            const masterItems = cloneItemsFromMasterAccount(masterAccount);
            setMasterItems(masterItems);
            setEditMode(false);
        }
        resetLoadingIndicator();

    }, [invokeLoadingIndicator, masterAccount, masterAccountService, masterItems, resetLoadingIndicator]);

    const handleCancelButtonClick = useCallback((): void => {
        // Re-clone data from master account
        const masterItems = cloneItemsFromMasterAccount(masterAccount);
        setMasterItems(masterItems);
        setEditMode(false);
    }, [masterAccount]);

    /**
     * NavigationRail children
     */
    const navigationRailChildNodes = [
        <Tooltip key="stats" title="Item stats" placement="right">
            <div>
                <IconButton
                    component={Link}
                    to="stats"
                    children={<EqualizerIcon />}
                    size="large" />
            </div>
        </Tooltip>,
        <Tooltip key="import" title="Upload item data" placement="right">
            <div>
                {/* TODO Implement this */}
                <IconButton children={<PublishIcon />} disabled size="large" />
            </div>
        </Tooltip>,
        <Tooltip key="export" title="Download item data" placement="right">
            <div>
                {/* TODO Implement this */}
                <IconButton children={<GetApp />} disabled size="large" />
            </div>
        </Tooltip>
    ];

    /**
     * FabContainer children
     */
    let fabContainerChildNodes: ReactNode;
    if (!editMode) {
        fabContainerChildNodes = (
            <Tooltip key="edit" title="Edit">
                <div>
                    <Fab
                        color="primary"
                        onClick={handleEditButtonClick}
                        disabled={isLoadingIndicatorActive}
                        children={<EditIcon />}
                    />
                </div>
            </Tooltip>
        );
    } else {
        fabContainerChildNodes = [
            <Tooltip key="cancel" title="Cancel">
                <div>
                    <Fab
                        color="default"
                        onClick={handleCancelButtonClick}
                        disabled={isLoadingIndicatorActive}
                        children={<ClearIcon />}
                    />
                </div>
            </Tooltip>,
            <Tooltip key="save" title="Save">
                <div>
                    <Fab
                        color="primary"
                        onClick={handleSaveButtonClick}
                        disabled={isLoadingIndicatorActive}
                        children={<SaveIcon />}
                    />
                </div>
            </Tooltip>
        ];
    }

    return (
        <div className="flex column full-height">
            <PageTitle>
                {editMode ?
                    'Edit Item Inventory' :
                    'Item Inventory'
                }
            </PageTitle>
            <div className="flex overflow-hidden">
                <NavigationRail>
                    {navigationRailChildNodes}
                </NavigationRail>
                <LayoutPanelScrollable className="py-4 pr-4 full-height flex-fill scrollbar-track-border">
                    <MasterItemList editMode={editMode} masterItems={masterItems} />
                </LayoutPanelScrollable>
            </div>
            <FabContainer children={fabContainerChildNodes} />
        </div>
    );

});

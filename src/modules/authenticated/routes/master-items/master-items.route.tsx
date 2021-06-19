import { Fab, IconButton, Tooltip } from '@material-ui/core';
import { Clear as ClearIcon, Edit as EditIcon, Equalizer as EqualizerIcon, GetApp, Publish as PublishIcon, Save as SaveIcon } from '@material-ui/icons';
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { LayoutPanelScrollable } from '../../../../components/layout/layout-panel-scrollable.component';
import { NavigationRail } from '../../../../components/navigation/navigation-rail.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { GameItemConstants } from '../../../../constants';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { LoadingIndicatorOverlayService } from '../../../../services/user-interface/loading-indicator-overlay.service';
import { MasterAccount, MasterItem, Nullable } from '../../../../types';
import { MasterItemList } from './master-item-list.component';

const cloneItemsFromMasterAccount = (account: Nullable<MasterAccount>): Array<MasterItem> => {
    if (!account) {
        return [];
    }
    const masterItems: MasterItem[] = [];
    for (const masterItem of account.items) {
        masterItems.push({ ...masterItem });
    }
    /*
     * Also push QP amount as part of the master items list. This will be removed
     * later when the list is saved.
     */
    masterItems.push({
        itemId: GameItemConstants.QpItemId,
        quantity: account.qp
    });
    return masterItems;
};

export const MasterItemsRoute = React.memo(() => {
    const forceUpdate = useForceUpdate();

    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    /**
     * Clone of the `items` array from the `MasterAccount` object.
     */
    const [masterItems, setMasterItems] = useState<Array<MasterItem>>([]);
    const [editMode, setEditMode] = useState<boolean>(false);

    const loadingIndicatorIdRef = useRef<string>();

    const resetLoadingIndicator = useCallback((): void => {
        const loadingIndicatorId = loadingIndicatorIdRef.current;
        if (loadingIndicatorId) {
            LoadingIndicatorOverlayService.waive(loadingIndicatorId);
            loadingIndicatorIdRef.current = undefined;
            forceUpdate();
        }
    }, [loadingIndicatorIdRef, forceUpdate]);

    /**
     * onCurrentMasterAccountChange subscriptions
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = MasterAccountService.onCurrentMasterAccountChange
            .subscribe(account => {
                const masterItems = cloneItemsFromMasterAccount(account);
                setMasterAccount(account);
                setMasterItems(masterItems);
                setEditMode(false);
            });

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
                const masterItems = cloneItemsFromMasterAccount(account);
                resetLoadingIndicator();
                setMasterAccount(account);
                setMasterItems(masterItems);
                setEditMode(false);
            });

        return () => onCurrentMasterAccountUpdatedSubscription.unsubscribe();
    }, [resetLoadingIndicator]);

    const handleUpdateError = useCallback((error: any): void => {
        // TODO Display error message to user.
        console.error(error);
        const masterItems = cloneItemsFromMasterAccount(masterAccount);
        resetLoadingIndicator();
        setMasterItems(masterItems);
        setEditMode(false);
    }, [masterAccount, resetLoadingIndicator]);

    const handleEditButtonClick = useCallback((): void => {
        setEditMode(true);
    }, []);

    const handleSaveButtonClick = useCallback((): void => {
        /*
         * QP is stored as a standalone property in the `MasterAccount` object, so it
         * needs to be separated out of the items list.
         */
        const qpItem = masterItems.find(item => item.itemId === GameItemConstants.QpItemId);
        const items = masterItems.filter(item => item.itemId !== GameItemConstants.QpItemId);

        const update = {
            _id: masterAccount?._id,
            items,
            qp: qpItem?.quantity || 0
        };
        MasterAccountService.updateAccount(update)
            .catch(handleUpdateError.bind(this));

        let loadingIndicatorId = loadingIndicatorIdRef.current;
        if (!loadingIndicatorId) {
            loadingIndicatorId = LoadingIndicatorOverlayService.invoke();
        }
        loadingIndicatorIdRef.current = loadingIndicatorId;

    }, [masterItems, masterAccount?._id, handleUpdateError]);

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
                    to="items/stats"
                    children={<EqualizerIcon />}
                />
            </div>
        </Tooltip>,
        <Tooltip key="import" title="Upload item data" placement="right">
            <div>
                {/* TODO Implement this */}
                <IconButton children={<PublishIcon />} disabled />
            </div>
        </Tooltip>,
        <Tooltip key="export" title="Download item data" placement="right">
            <div>
                {/* TODO Implement this */}
                <IconButton children={<GetApp />} disabled />
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
                        disabled={!!loadingIndicatorIdRef.current}
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
                        disabled={!!loadingIndicatorIdRef.current}
                        children={<ClearIcon />}
                    />
                </div>
            </Tooltip>,
            <Tooltip key="save" title="Save">
                <div>
                    <Fab
                        color="primary"
                        onClick={handleSaveButtonClick}
                        disabled={!!loadingIndicatorIdRef.current}
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
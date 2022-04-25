import { MasterAccount } from '@fgo-planner/types';
import { Clear as ClearIcon, Edit as EditIcon, FormatListBulleted as FormatListBulletedIcon, Save as SaveIcon } from '@mui/icons-material';
import { Fab, IconButton, Tooltip } from '@mui/material';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { LayoutPanelScrollable } from '../../../../components/layout/layout-panel-scrollable.component';
import { NavigationRail } from '../../../../components/navigation/navigation-rail.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useLoadingIndicator } from '../../../../hooks/user-interface/use-loading-indicator.hook';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { Nullable } from '../../../../types/internal';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { MasterServantCostumesListHeader } from './master-servant-costumes-list-header.component';
import { MasterServantCostumesList } from './master-servant-costumes-list.component';

const getUnlockedCostumeSetFromMasterAccount = (account: Nullable<MasterAccount>): Set<number> => {
    if (!account) {
        return new Set();
    }
    return new Set(account.costumes);
};

export const MasterServantCostumesRoute = React.memo(() => {

    const {
        invokeLoadingIndicator,
        resetLoadingIndicator,
        isLoadingIndicatorActive
    } = useLoadingIndicator();

    const masterAccountService = useInjectable(MasterAccountService);

    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    const [unlockedCostumesSet, setUnlockedCostumesSet] = useState<Set<number>>(new Set());
    const [editMode, setEditMode] = useState<boolean>(false);

    /*
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(account => {
                const unlockedCostumesSet = getUnlockedCostumeSetFromMasterAccount(account);
                setMasterAccount(account);
                setUnlockedCostumesSet(unlockedCostumesSet);
                setEditMode(false);
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    const handleEditButtonClick = useCallback((): void => {
        setEditMode(true);
    }, []);

    const handleSaveButtonClick = useCallback(async (): Promise<void> => {
        const masterAccountId = masterAccount?._id;
        if (!masterAccountId) {
            return;
        }
        invokeLoadingIndicator();
        
        const update = {
            _id: masterAccountId,
            costumes: [...unlockedCostumesSet]
        };
        try {
            await masterAccountService.updateAccount(update);
        } catch (error: any) {
            // TODO Display error message to user.
            console.error(error);
            const unlockedCostumesSet = getUnlockedCostumeSetFromMasterAccount(masterAccount);
            setUnlockedCostumesSet(unlockedCostumesSet);
            setEditMode(false);
        }
        resetLoadingIndicator();

    }, [invokeLoadingIndicator, masterAccount, masterAccountService, resetLoadingIndicator, unlockedCostumesSet]);

    const handleCancelButtonClick = useCallback((): void => {
        // Re-clone data from master account
        const unlockedCostumesSet = getUnlockedCostumeSetFromMasterAccount(masterAccount);
        setUnlockedCostumesSet(unlockedCostumesSet);
        setEditMode(false);
    }, [masterAccount]);

    /**
     * NavigationRail children
     */
    const navigationRailChildNodes: ReactNode = (
        <Tooltip key="servants" title="Back to servant list" placement="right">
            <div>
                <IconButton
                    component={Link}
                    to="../master/servants"
                    children={<FormatListBulletedIcon />}
                    size="large" />
            </div>
        </Tooltip>
    );

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
                    'Edit Unlocked Costumes' :
                    'Unlocked Costumes'
                }
            </PageTitle>
            <div className="flex overflow-hidden">
                <NavigationRail children={navigationRailChildNodes} />
                <div className="flex flex-fill" style={{maxWidth: 'calc(100% - 56px)'}}>
                    <LayoutPanelScrollable 
                        className="py-4 pr-4 full-height flex-fill scrollbar-track-border"
                        headerContents={
                            <MasterServantCostumesListHeader />
                        }
                        children={
                            <MasterServantCostumesList
                                unlockedCostumesSet={unlockedCostumesSet}
                                editMode={editMode}
                            />
                        }
                    />
                </div>
            </div>
            <FabContainer children={fabContainerChildNodes} />
        </div>
    );

});

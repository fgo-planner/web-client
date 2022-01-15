import { MasterAccount, Plan, PlanServant, PlanServantOwned, PlanServantType, PlanServantUnowned } from '@fgo-planner/types';
import { Add as AddIcon, AddShoppingCart as AddShoppingCartIcon, Clear as ClearIcon, Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { Button, Fab, Tooltip } from '@mui/material';
import lodash from 'lodash';
import React, { Fragment, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { PlanService } from '../../../../services/data/plan/plan.service';
import { LoadingIndicatorOverlayService } from '../../../../services/user-interface/loading-indicator-overlay.service';
import { Nullable } from '../../../../types/internal';
import { PlanServantUtils } from '../../../../utils/plan/plan-servant.utils';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopic } from '../../../../utils/subscription/subscription-topic';
import { DialogData as PlanServantEditDialogData, PlanServantEditDialog } from '../../components/plan/servant/edit-dialog/plan-servant-edit-dialog.component';

type PlanData = {
    planServants: Array<PlanServant>;
};

const getDefaultPlanData = (): PlanData => ({
    planServants: []
});

const getPlanData = (plan: Nullable<Plan>, clone = false): PlanData => {
    if (!plan) {
        return getDefaultPlanData();
    }
    if (clone) {
        return {
            planServants: plan.servants.map(PlanServantUtils.clone)
        };
    }
    return {
        planServants: plan.servants
    };
};

export const PlanRoute = React.memo(() => {

    const routeMatch = useMatch<'id'>('/user/master/planner/:id');
    const planId = routeMatch?.params.id;

    const forceUpdate = useForceUpdate();
    const navigate = useNavigate();

    const loadingIndicatorOverlayService = useInjectable(LoadingIndicatorOverlayService);
    const planService = useInjectable(PlanService);

    const [plan, setPlan] = useState<Plan>();
    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    const [showAppendSkills, setShowAppendSkills] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [editServant, setEditServant] = useState<PlanServant>();
    const [editServantDefaultType, setEditServantDefaultType] = useState<PlanServantType>();
    const [editServantDialogOpen, setEditServantDialogOpen] = useState<boolean>(false);
    const [deleteServant, setDeleteServant] = useState<PlanServant>();
    const [deleteServantDialogOpen, setDeleteServantDialogOpen] = useState<boolean>(false);

    const loadingIndicatorIdRef = useRef<string>();

    /**
     * Contains the `servants` data from the currently loaded `Plan` object. In edit
     * mode, the data is cloned to avoid unwanted modification of the original data.
     *
     * The data is stored as a ref to prevent unwanted triggering of hooks on
     * change.
     */
    const planDataRef = useRef<PlanData>(getDefaultPlanData());

    const gameServantMap = useGameServantMap();

    const resetLoadingIndicator = useCallback((): void => {
        const loadingIndicatorId = loadingIndicatorIdRef.current;
        if (loadingIndicatorId) {
            loadingIndicatorOverlayService.waive(loadingIndicatorId);
            loadingIndicatorIdRef.current = undefined;
            forceUpdate();
        }
    }, [forceUpdate, loadingIndicatorOverlayService]);

    /**
     * Initial load of plan data.
     */
    useEffect(() => {
        if (!planId) {
            console.error('Could not parse plan ID from route.');
        } else {
            let loadingIndicatorId = loadingIndicatorIdRef.current;
            if (!loadingIndicatorId) {
                loadingIndicatorId = loadingIndicatorOverlayService.invoke();
            }
            loadingIndicatorIdRef.current = loadingIndicatorId;
            const loadPlan = async (): Promise<void> => {
                const plan = await planService.getPlan(planId);
                // TODO Sanitize plan against current master account data.
                planDataRef.current = getPlanData(plan);
                setPlan(plan);
                resetLoadingIndicator();
            };
            loadPlan();
        }
    }, [loadingIndicatorOverlayService, planId, planService, resetLoadingIndicator]);

    /*
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopic.User_CurrentMasterAccountChange)
            .subscribe(account => {
                const isSameAccount = masterAccount?._id === account?._id;
                if (!masterAccount || isSameAccount) {
                    // TODO Sanitize current plan against master account data.
                    setMasterAccount(account);
                } else {
                    navigate('/user/master/planner');
                }
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, [masterAccount, navigate]);
    
    /**
     * Sends plan update request to the back-end.
     */
    const updatePlan = useCallback(async (): Promise<void> => {
        if (!plan) {
            return;
        }

        let loadingIndicatorId = loadingIndicatorIdRef.current;
        if (!loadingIndicatorId) {
            loadingIndicatorId = loadingIndicatorOverlayService.invoke();
        }
        loadingIndicatorIdRef.current = loadingIndicatorId;

        setEditServant(undefined);
        setEditServantDialogOpen(false);
        setDeleteServant(undefined);
        setDeleteServantDialogOpen(false);

        const { planServants } = planDataRef.current;

        const update: Partial<Plan> = {
            _id: plan._id,
            servants: planServants
        };
        try {
            const updatedPlan = await planService.updatePlan(update);
            planDataRef.current = getPlanData(updatedPlan);
            setPlan(updatedPlan);
        } catch (error: any) {
            // TODO Display error message to user.
            console.error(error);
            planDataRef.current = getPlanData(plan);
        }

        // updateSelectedServants();
        setEditMode(false);
        resetLoadingIndicator();

    }, [loadingIndicatorOverlayService, plan, planService, resetLoadingIndicator]);

    const handleEditButtonClick = useCallback((): void => {
        planDataRef.current = getPlanData(plan, true);
        // updateSelectedServants();
        setEditMode(true);
    }, [plan]);

    const handleCancelButtonClick = useCallback((): void => {
        // Copy data back from plan
        planDataRef.current = getPlanData(plan);
        // updateSelectedServants();
        setEditMode(false);
    }, [plan]);

    const openEditServantDialog = useCallback((value: PlanServant | PlanServantType): void => {
        if (!editMode) {
            return;
        }
        if (typeof value === 'object') {
            const planServant = value as PlanServant;
            setEditServant(planServant);
            setEditServantDefaultType(undefined);
        } else {
            const type = value as PlanServantType;
            setEditServant(undefined);
            setEditServantDefaultType(type);
        }
        setEditServantDialogOpen(true);
        setDeleteServant(undefined);
        setDeleteServantDialogOpen(false);
    }, [editMode]);

    const closeEditServantDialog = useCallback((): void => {
        setEditServant(undefined);
        setEditServantDialogOpen(false);
    }, []);

    const handleAddOwnedServantButtonClick = useCallback((): void => {
        openEditServantDialog(PlanServantType.Owned);
    }, [openEditServantDialog]);

    const handleAddUnownedServantButtonClick = useCallback((): void => {
        openEditServantDialog(PlanServantType.Unowned);
    }, [openEditServantDialog]);

    const handleEditServantDialogClose = useCallback((event: any, reason: any, data?: PlanServantEditDialogData): void => {
        /*
         * Close the dialog without taking any further action if the component is not
         * in edit mode, or if the changes were cancelled (if `data` is undefined, then
         * the changes were cancelled).
         */
        if (!editMode || !data) {
            return closeEditServantDialog();
        }

        const { planServants } = planDataRef.current;

        /*
         * If a new servant is being added, then `editServant` will be undefined.
         * Conversely, if an existing servant is being edited, then `editServant`
         * should be defined.
         */
        if (!editServant) {
            planServants.push(data.planServant);
        } else {
            /*
             * Merge changes into existing servant object.
             */
            lodash.assign(editServant, data.planServant);
            /*
             * Re-build the servant object to force its row to re-render.
             */
            const index = planServants.indexOf(editServant);
            if (index !== -1) {
                planServants[index] = { ...editServant };
            }
        }

        planDataRef.current.planServants = [...planServants]; // Forces child list to re-render
        closeEditServantDialog();
        // updateSelectedServants();
    }, [closeEditServantDialog, editMode, editServant]);

    const editServantDialogTitle = useMemo((): string => {
        let action: string, type: PlanServantType;
        if (!editServant) {
            action = 'Add';
            type = editServantDefaultType!;
        } else {
            action = 'Edit';
            type = editServant.type;
        }
        return `${action} ${type === PlanServantType.Owned ? 'Summoned' : 'Unsummoned'} Servant`;
    }, [editServant, editServantDefaultType]);

    const deleteServantDialogPrompt = useMemo((): string | undefined => {
        if (!deleteServant || !gameServantMap || !masterAccount) {
            return undefined;
        }
        let gameId: number;
        if (deleteServant.type === PlanServantType.Owned) {
            const { instanceId } = deleteServant as PlanServantOwned;
            const masterServant = masterAccount.servants.find(servant => servant.instanceId === instanceId);
            if (!masterServant) {
                return undefined;
            }
            gameId = masterServant.gameId;
        } else {
            gameId = (deleteServant as PlanServantUnowned).gameId;
        }
        const servant = gameServantMap[gameId];
        return `Are you sure you want to remove ${servant?.name} from the servant list?`;
    }, [deleteServant, gameServantMap, masterAccount]);

    /*
     * These can be undefined during the initial render.
     */
    if (!gameServantMap || !masterAccount || !plan) {
        return null;
    }

    /**
     * FabContainer children
     */
    let fabContainerChildNodes: ReactNode;
    if (!editMode) {
        fabContainerChildNodes = (
            <Tooltip key='edit' title='Edit mode'>
                <div>
                    <Fab
                        color='primary'
                        onClick={handleEditButtonClick}
                        disabled={!!loadingIndicatorIdRef.current}
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
                        disabled={!!loadingIndicatorIdRef.current}
                        children={<ClearIcon />}
                    />
                </div>
            </Tooltip>,
            <Tooltip key='save' title='Save changes'>
                <div>
                    <Fab
                        color='primary'
                        onClick={updatePlan}
                        disabled={!!loadingIndicatorIdRef.current}
                        children={<SaveIcon />}
                    />
                </div>
            </Tooltip>
        ];
    }  

    return (
        <Fragment>
            {editMode &&
                <div>
                    <div>
                        <Button onClick={handleAddOwnedServantButtonClick}>
                            <AddIcon /> Add Summoned
                        </Button>
                    </div>
                    <div>
                        <Button onClick={handleAddUnownedServantButtonClick}>
                            <AddShoppingCartIcon /> Add Unsummoned
                        </Button>
                    </div>
                </div>
            }
            <FabContainer children={fabContainerChildNodes} />
            <PlanServantEditDialog
                open={editServantDialogOpen}
                dialogTitle={editServantDialogTitle}
                submitButtonLabel={editMode ? 'Done' : 'Save'}
                defaultType={editServantDefaultType}
                planServant={editServant}
                planServants={plan.servants}
                masterServants={masterAccount.servants}
                disableServantSelect={!!editServant}
                showAppendSkills={showAppendSkills}
                unlockedCostumes={masterAccount.costumes}
                onClose={handleEditServantDialogClose}
            />
        </Fragment>
    )

});

import { MasterAccount, Plan, PlanServant, PlanServantOwned, PlanServantType, PlanServantUnowned } from '@fgo-planner/types';
import { Add as AddIcon, AddShoppingCart as AddShoppingCartIcon, Clear as ClearIcon, Save as SaveIcon } from '@mui/icons-material';
import { Button, Fab, Tooltip } from '@mui/material';
import lodash from 'lodash';
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

/**
 * Returns cloned servant data from the given plan.
 */
const clonePlan = (plan: Plan): Plan => {
    return {
        ...plan,
        enabled: {
            ...plan.enabled
        },
        servants: plan.servants.map(servant => PlanServantUtils.clone(servant)),
        inventory: {
            ...plan.inventory
        }
    };
};

export const PlanRoute = React.memo(() => {

    const routeMatch = useMatch<'id'>('/user/master/planner/:id');
    const planId = routeMatch?.params.id;

    const forceUpdate = useForceUpdate();
    const navigate = useNavigate();

    const loadingIndicatorOverlayService = useInjectable(LoadingIndicatorOverlayService);
    const planService = useInjectable(PlanService);

    /**
     * Whether the user has made any unsaved changes.
     */
    const [dirty, setDirty] = useState<boolean>(false); // TODO Rename this
    /**
     * The plan data loaded from the backend. This should not be modified or used
     * anywhere in this route, except when reverting changes. Use `planRef` instead.
     */
    const [plan, setPlan] = useState<Plan>();
    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();

    const [showAppendSkills, setShowAppendSkills] = useState<boolean>(false);

    const [editServantTarget, setEditServantTarget] = useState<PlanServant>();
    const [editServantDefaultType, setEditServantDefaultType] = useState<PlanServantType>();
    const [editServantDialogOpen, setEditServantDialogOpen] = useState<boolean>(false);

    const [deleteServantTarget, setDeleteServantTarget] = useState<PlanServant>();
    const [deleteServantDialogOpen, setDeleteServantDialogOpen] = useState<boolean>(false);

    const loadingIndicatorIdRef = useRef<string>();

    /**
     * Contains a clone of the currently loaded `Plan` object.
     *
     * The data is cloned to avoid unwanted modification of the original data. In
     * addition, the data is stored as a ref to prevent unwanted triggering of hooks
     * on change.
     */
    const planRef = useRef<Plan>();

    const gameServantMap = useGameServantMap();

    const resetLoadingIndicator = useCallback((): void => {
        const loadingIndicatorId = loadingIndicatorIdRef.current;
        if (loadingIndicatorId) {
            loadingIndicatorOverlayService.waive(loadingIndicatorId);
            loadingIndicatorIdRef.current = undefined;
            forceUpdate();
        }
    }, [forceUpdate, loadingIndicatorOverlayService]);

    /*
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
                planRef.current = clonePlan(plan);
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
        let loadingIndicatorId = loadingIndicatorIdRef.current;
        if (!loadingIndicatorId) {
            loadingIndicatorId = loadingIndicatorOverlayService.invoke();
        }
        loadingIndicatorIdRef.current = loadingIndicatorId;

        setEditServantTarget(undefined);
        setEditServantDialogOpen(false);
        setDeleteServantTarget(undefined);
        setDeleteServantDialogOpen(false);

        try {
            /*
             * Use the entire plan as the update request payload. 
             */
            const updatedPlan = await planService.updatePlan(planRef.current!);
            planRef.current = clonePlan(updatedPlan);
            setPlan(updatedPlan);
            setDirty(false);
        } catch (error: any) {
            // TODO Display error message to user.
            console.error(error);
            planRef.current = clonePlan(plan!);
        }

        // updateSelectedServants();
        resetLoadingIndicator();

    }, [loadingIndicatorOverlayService, plan, planService, resetLoadingIndicator]);

    const handleSaveButtonClick = useCallback((): void => {
        updatePlan();
    }, [updatePlan]);

    const handleRevertButtonClick = useCallback((): void => {
        // Copy data back from plan
        planRef.current = clonePlan(plan!);
        // updateSelectedServants();
        setDirty(false);
    }, [plan]);

    const openEditServantDialog = useCallback((value: PlanServant | PlanServantType): void => {
        if (typeof value === 'object') {
            const planServant = value as PlanServant;
            setEditServantTarget(planServant);
            setEditServantDefaultType(undefined);
        } else {
            const type = value as PlanServantType;
            setEditServantTarget(undefined);
            setEditServantDefaultType(type);
        }
        setEditServantDialogOpen(true);
        setDeleteServantTarget(undefined);
        setDeleteServantDialogOpen(false);
    }, []);

    const closeEditServantDialog = useCallback((): void => {
        setEditServantTarget(undefined);
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
         * Close the dialog without taking any further action if the changes were
         * cancelled (if `data` is undefined, then the changes were cancelled).
         */
        if (!data) {
            return closeEditServantDialog();
        }

        const plan = planRef.current!; // Not possible to be null here.
        const planServants = plan.servants;

        /*
         * If a new servant is being added, then `editServant` will be undefined.
         * Conversely, if an existing servant is being edited, then `editServant`
         * should be defined.
         */
        if (!editServantTarget) {
            planServants.push(data.planServant);
        } else {
            // TODO Compare objects and just close dialog if there are no changes.
            /*
             * Merge changes into existing servant object.
             */
            lodash.assign(editServantTarget, data.planServant);
            /*
             * Re-build the servant object to force its row to re-render.
             */
            const index = planServants.indexOf(editServantTarget);
            if (index !== -1) {
                planServants[index] = { ...editServantTarget };
            }
        }

        plan.servants = [...planServants]; // Forces child list to re-render

        setDirty(true);
        closeEditServantDialog();
        // updateSelectedServants();
    }, [closeEditServantDialog, editServantTarget]);

    const editServantDialogTitle = useMemo((): string => {
        let action: string, type: PlanServantType;
        if (!editServantTarget) {
            action = 'Add';
            type = editServantDefaultType!;
        } else {
            action = 'Edit';
            type = editServantTarget.type;
        }
        return `${action} ${type === PlanServantType.Owned ? 'Summoned' : 'Unsummoned'} Servant`;
    }, [editServantDefaultType, editServantTarget]);

    const deleteServantDialogPrompt = useMemo((): string | undefined => {
        if (!deleteServantTarget || !gameServantMap || !masterAccount) {
            return undefined;
        }
        let gameId: number;
        if (deleteServantTarget.type === PlanServantType.Owned) {
            const { instanceId } = deleteServantTarget as PlanServantOwned;
            const masterServant = masterAccount.servants.find(servant => servant.instanceId === instanceId);
            if (!masterServant) {
                return undefined;
            }
            gameId = masterServant.gameId;
        } else {
            gameId = (deleteServantTarget as PlanServantUnowned).gameId;
        }
        const servant = gameServantMap[gameId];
        return `Are you sure you want to remove ${servant?.name} from the servant list?`;
    }, [deleteServantTarget, gameServantMap, masterAccount]);

    /*
     * These can be undefined during the initial render. `plan` can also be
     * undefined, but it is a redundant check because `planRef.current` would also
     * be undefined.
     */
    if (!gameServantMap || !masterAccount || !planRef.current) {
        return null;
    }  

    return (
        <Fragment>
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
            <FabContainer>
                <Tooltip title='Revert changes'>
                    <div>
                        <Fab
                            color='default'
                            onClick={handleRevertButtonClick}
                            disabled={!dirty || !!loadingIndicatorIdRef.current}
                            children={<ClearIcon />}
                        />
                    </div>
                </Tooltip>
                <Tooltip title='Save changes'>
                    <div>
                        <Fab
                            color='primary'
                            onClick={handleSaveButtonClick}
                            disabled={!dirty || !!loadingIndicatorIdRef.current}
                            children={<SaveIcon />}
                        />
                    </div>
                </Tooltip>
            </FabContainer>
            <PlanServantEditDialog
                open={editServantDialogOpen}
                dialogTitle={editServantDialogTitle}
                submitButtonLabel='Done'
                defaultType={editServantDefaultType}
                planServant={editServantTarget}
                planServants={planRef.current.servants}
                masterServants={masterAccount.servants}
                showAppendSkills={showAppendSkills}
                unlockedCostumes={masterAccount.costumes}
                onClose={handleEditServantDialogClose}
            />
        </Fragment>
    )

});

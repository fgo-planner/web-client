import { MasterAccount, MasterServant, Plan, PlanServant, PlanServantOwned, PlanServantType, PlanServantUnowned } from '@fgo-planner/types';
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
import { GameServantMap, ImmutableArray, Nullable } from '../../../../types/internal';
import { PlanComputationUtils, PlanRequirements } from '../../../../utils/plan/plan-computation.utils';
import { PlanServantUtils } from '../../../../utils/plan/plan-servant.utils';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopic } from '../../../../utils/subscription/subscription-topic';
import { DialogData as PlanServantEditDialogData, PlanServantEditDialog } from '../../components/plan/servant/edit/plan-servant-edit-dialog.component';

/**
 * Instantiates a new `PlanServantOwned` based on the available owned servants
 * that have not yet been added to the plan. If there are multiple servants
 * available, then the first available servant is used. If there are no servants
 * available, then an error will be thrown.
 *
 * @param planServants The servants that are already added to the plan.
 * @param masterServants The servants owned by the master account.
 */
const instantiateOwnedPlanServant = (
    planServants: ImmutableArray<PlanServant>,
    masterServants: ImmutableArray<MasterServant>
): PlanServantOwned => {
    /**
     * Owned servants that have not been added to the plan yet.
     */
    const availableServants = PlanServantUtils.findAvailableOwnedServants(planServants, masterServants);
    if (!availableServants.length) {
        throw new Error('No more owned servants available');
    }
    /*
     * Instantiate using first available servant.
     */
    const masterServant = availableServants[0];
    const planServant = PlanServantUtils.instantiate(masterServant.gameId, masterServant.instanceId);
    PlanServantUtils.updateCurrentEnhancements(planServant, masterServant);
    // TODO Populate costume data.
    return planServant;

    /*
     * If there were no more owned servants available, or if `type` was specified as
     * `Unowned`, then instantiate an unowned servant.
     */
    // const availableServants = PlanServantUtils.findAvailableUnownedServants(planServants, masterServants);
    // return PlanServantUtils.instantiate(GameServantConstants.DefaultServantId);
};

/**
 * Instantiates a new `PlanServantUnowned` based on the available game servants
 * that have not yet been added to the plan. If there are multiple servants
 * available, then the first available servant is used. If there are no servants
 * available, then an error will be thrown.
 *
 * @param planServants The servants that are already added to the plan.
 * @param masterServants The servants owned by the master account.
 */
const instantiateUnownedPlanServant = (
    planServants: ImmutableArray<PlanServant>,
    gameServantMap: GameServantMap
): PlanServantUnowned => {
    const gameServants = Object.values(gameServantMap);
    /**
     * Owned servants that have not been added to the plan yet.
     */
    const availableServants = PlanServantUtils.findAvailableUnownedServants(planServants, gameServants);
    if (!availableServants.length) {
        throw new Error('No more servants available');
    }
    /*
     * Instantiate using first available servant.
     */
    const gameServant = availableServants[0];
    return PlanServantUtils.instantiate(gameServant._id);
};

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

    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    /**
     * The plan data loaded from the backend. This should not be modified or used
     * anywhere in this route, except when reverting changes. Use `planRef` instead.
     */
    const [plan, setPlan] = useState<Plan>();
    /**
     * Whether the user has made any unsaved changes.
     */
    const [dirty, setDirty] = useState<boolean>(false); // TODO Rename this

    const [showAppendSkills, setShowAppendSkills] = useState<boolean>(true); // TODO Change this back to false

    const [editServantTarget, setEditServantTarget] = useState<PlanServant>();
    // const [editServantDialogOpen, setEditServantDialogOpen] = useState<boolean>(false);

    const [deleteServantTarget, setDeleteServantTarget] = useState<PlanServant>();
    const [deleteServantDialogOpen, setDeleteServantDialogOpen] = useState<boolean>(false);

    const loadingIndicatorIdRef = useRef<string>();

    /**
     * Reference to the original copy of the servant being edited. The
     * `editServantTarget` state contains a clone so that the original is not
     * modified until the changes are submitted.
     *
     * When adding a new servant, this will remain `undefined`.
     */
    const editServantTargetRef = useRef<PlanServant>();

    /**
     * Contains a clone of the currently loaded `Plan` object.
     *
     * The data is cloned to avoid unwanted modification of the original data. In
     * addition, the data is stored as a ref to prevent unwanted triggering of hooks
     * on change.
     */
    const planRef = useRef<Plan>();

    const planRequirementsRef = useRef<PlanRequirements>();

    const gameServantMap = useGameServantMap();

    const resetLoadingIndicator = useCallback((): void => {
        const loadingIndicatorId = loadingIndicatorIdRef.current;
        if (loadingIndicatorId) {
            loadingIndicatorOverlayService.waive(loadingIndicatorId);
            loadingIndicatorIdRef.current = undefined;
            forceUpdate();
        }
    }, [forceUpdate, loadingIndicatorOverlayService]);

    const computePlanRequirements = useCallback(() => {
        /*
         * We don't have to actually check if `plan` is undefined here, because if
         * `planRef.current` is undefined then so is `plan` (and vice versa), so we only
         * have to check one of the two. However, we need to trigger a this hook when
         * `plan` is loaded, so we check it here anyways so that we can add it as a hook
         * dependency without eslint complaining.
         */
        if (!gameServantMap || !masterAccount || !plan || !planRef.current) {
            return;
        }
        const planRequirements = PlanComputationUtils.computePlanRequirements(
            gameServantMap,
            masterAccount,
            planRef.current
            // TODO Add previous plans
        );
        planRequirementsRef.current = planRequirements;
        // TODO Do we need to call forceUpdate here?
    }, [gameServantMap, masterAccount, plan]);

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
                    computePlanRequirements();
                } else {
                    navigate('/user/master/planner');
                }
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, [computePlanRequirements, masterAccount, navigate]);
    
    /**
     * Sends plan update request to the back-end.
     */
    const updatePlan = useCallback(async (): Promise<void> => {
        let loadingIndicatorId = loadingIndicatorIdRef.current;
        if (!loadingIndicatorId) {
            loadingIndicatorId = loadingIndicatorOverlayService.invoke();
        }
        loadingIndicatorIdRef.current = loadingIndicatorId;

        editServantTargetRef.current = undefined;
        setEditServantTarget(undefined);
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
            computePlanRequirements();
        } catch (error: any) {
            // TODO Display error message to user.
            console.error(error);
            planRef.current = clonePlan(plan!);
        }

        // updateSelectedServants();
        resetLoadingIndicator();

    }, [computePlanRequirements, loadingIndicatorOverlayService, plan, planService, resetLoadingIndicator]);

    const handleSaveButtonClick = useCallback((): void => {
        updatePlan();
    }, [updatePlan]);

    const handleRevertButtonClick = useCallback((): void => {
        // Copy data back from plan
        planRef.current = clonePlan(plan!);
        // updateSelectedServants();
        setDirty(false);
        computePlanRequirements();
    }, [computePlanRequirements, plan]);

    const openEditServantDialog = useCallback((value: PlanServant | PlanServantType): void => {
        if (typeof value === 'object') {
            const planServant = value as PlanServant;
            editServantTargetRef.current = planServant;
            setEditServantTarget(PlanServantUtils.clone(planServant));
        } else {
            const type = value as PlanServantType;
            const plan = planRef.current!;
            let editServantTarget;
            if (type === PlanServantType.Owned) {
                editServantTarget = instantiateOwnedPlanServant(plan.servants, masterAccount!.servants);
            } else {
                editServantTarget = instantiateUnownedPlanServant(plan.servants, gameServantMap!);
            }
            editServantTargetRef.current = undefined;
            setEditServantTarget(editServantTarget);
        }
        setDeleteServantTarget(undefined);
        setDeleteServantDialogOpen(false);
    }, [gameServantMap, masterAccount]);

    const closeEditServantDialog = useCallback((): void => {
        editServantTargetRef.current = undefined;
        setEditServantTarget(undefined);
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
        computePlanRequirements();
        // updateSelectedServants();
    }, [closeEditServantDialog, computePlanRequirements, editServantTarget]);

    const editServantDialogTitle = useMemo((): string => {
        const action = !editServantTargetRef.current ? 'Add' : 'Edit';
        const ownership = editServantTarget?.type === PlanServantType.Owned ? 'Summoned' : 'Unsummoned';
        return `${action} ${ownership} Servant`;
    }, [editServantTarget]);

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
     * These can be undefined during the initial render.
     *
     * Note that if `planRef.current` is undefined, then `plan` would also be
     * undefined (and vice versa), so we only need to check one of the two here.
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
                open={!!editServantTarget}
                dialogTitle={editServantDialogTitle}
                submitButtonLabel='Done'
                planServant={editServantTarget!}
                planServants={planRef.current.servants}
                masterServants={masterAccount.servants}
                showAppendSkills={showAppendSkills}
                unlockedCostumes={masterAccount.costumes}
                onClose={handleEditServantDialogClose}
            />
        </Fragment>
    );

});

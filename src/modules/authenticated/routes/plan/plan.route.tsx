import { MasterAccount, MasterServant, Plan, PlanServant } from '@fgo-planner/types';
import { Add as AddIcon, Clear as ClearIcon, FormatSize as FormatSizeIcon, HideImageOutlined as HideImageOutlinedIcon, Save as SaveIcon } from '@mui/icons-material';
import { Fab, IconButton, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { LayoutPanelContainer, StyleClassPrefix as LayoutPanelContainerStyleClassPrefix } from '../../../../components/layout/layout-panel-container.component';
import { NavigationRail } from '../../../../components/navigation/navigation-rail.component';
import { PlanRequirementsTableOptions } from '../../../../components/plan/requirements/table/plan-requirements-table-options.type';
import { PlanRequirementsTable } from '../../../../components/plan/requirements/table/plan-requirements-table.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { PlanService } from '../../../../services/data/plan/plan.service';
import { LoadingIndicatorOverlayService } from '../../../../services/user-interface/loading-indicator-overlay.service';
import { PlanRequirements } from '../../../../types/data';
import { Immutable, ImmutableArray, Nullable } from '../../../../types/internal';
import { PlanComputationUtils } from '../../../../utils/plan/plan-computation.utils';
import { PlanServantUtils } from '../../../../utils/plan/plan-servant.utils';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopic } from '../../../../utils/subscription/subscription-topic';
import { DialogData as PlanServantEditDialogData, PlanServantEditDialog } from '../../components/plan/servant/edit/plan-servant-edit-dialog.component';

const instantiateDefaultTableOptions = (): PlanRequirementsTableOptions => ({
    displayItems: {
        unused: true,
        statues: true,
        gems: true,
        lores: true,
        grails: true,
        embers: true,
        fous: true
    }
});

/**
 * Instantiates a new `PlanServant` based on the available servants in the
 * master account (a servant is available if it has not yet been added to the
 * plan). If there are multiple servants available, then the first available
 * servant is used. If there are no servants available, then an error will be
 * thrown.
 *
 * @param planServants The servants that are already added to the plan.
 * @param masterServants The servants in the master account.
 */
const instantiatePlanServant = (
    planServants: ImmutableArray<PlanServant>,
    masterServants: ImmutableArray<MasterServant>
): PlanServant => {
    /**
     * Servants that have not been added to the plan yet.
     */
    const availableServants = PlanServantUtils.findAvailableServants(planServants, masterServants);
    if (!availableServants.length) {
        throw new Error('No more servants available');
    }
    /*
     * Instantiate using first available servant.
     */
    const masterServant = availableServants[0];
    const planServant = PlanServantUtils.instantiate(masterServant.instanceId);
    PlanServantUtils.updateCurrentEnhancements(planServant, masterServant);
    // TODO Populate costume data.
    return planServant;
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

const StyleClassPrefix = 'Plan';

const StyleProps = (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    [`& .${StyleClassPrefix}-switch-container`]: {
        px: 4,
        mb: -6
    },
    [`& .${StyleClassPrefix}-main-content`]: {
        display: 'flex',
        flex: '1',
        width: 'calc(100% - 48px)',
        [`& .${LayoutPanelContainerStyleClassPrefix}-root`]: {
            display: 'flex',
            flex: 1,
            height: 'fit-content',
            maxHeight: '100%',
            pr: 4,
            py: 4
        }
    },
    [`& .${StyleClassPrefix}-info-panel-container`]: {
        width: 320,
        height: 'calc(100% - 84px)',
        pr: 4,
        py: 4,
        boxSizing: 'border-box',
        [theme.breakpoints.down('xl')]: {
            width: 300
        }
    }
} as SystemStyleObject<Theme>);

export const PlanRoute = React.memo(() => {

    const routeMatch = useMatch<'id'>('/user/master/planner/:id');
    const planId = routeMatch?.params.id;

    const forceUpdate = useForceUpdate();
    const navigate = useNavigate();

    const loadingIndicatorOverlayService = useInjectable(LoadingIndicatorOverlayService);
    const planService = useInjectable(PlanService);

    const [masterAccount, setMasterAccount] = useState<Nullable<Immutable<MasterAccount>>>();
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
    const [tableOptions, setTableOptions] = useState<PlanRequirementsTableOptions>(instantiateDefaultTableOptions);

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
    const editServantTargetRef = useRef<Immutable<PlanServant>>();

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
        /*
         * Force update is needed here because if the plan loads in after the other data
         * (servant map and master account data), then the component wont be re-rendered
         * after requirements are computed.
         */
        forceUpdate();
    }, [forceUpdate, gameServantMap, masterAccount, plan]);

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


    //#region Input event handlers

    const handleToggleLayout = useCallback((): void => {
        tableOptions.layout = tableOptions.layout === 'condensed' ? 'normal' : 'condensed';
        setTableOptions({ ...tableOptions });
    }, [tableOptions]);

    const handleToggleShowUnused = useCallback((): void => {
        const { displayItems } = tableOptions;
        displayItems.unused = !displayItems.unused;
        setTableOptions({
            ...tableOptions,
            displayItems: { ...displayItems }
        });
    }, [tableOptions]);

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

    const openEditServantDialog = useCallback((planServant?: Immutable<PlanServant>): void => {
        if (!planServant) {
            /*
             * Adding a planned servant.
             */
            const plan = planRef.current!;
            const editServantTarget = instantiatePlanServant(plan.servants, masterAccount!.servants);
            editServantTargetRef.current = undefined;
            setEditServantTarget(editServantTarget);
        } else {
            /*
             * Editing a planned servant.
             */
            editServantTargetRef.current = planServant;
            setEditServantTarget(PlanServantUtils.clone(planServant));
        }
        setDeleteServantTarget(undefined);
        setDeleteServantDialogOpen(false);
    }, [masterAccount]);

    const closeEditServantDialog = useCallback((): void => {
        editServantTargetRef.current = undefined;
        setEditServantTarget(undefined);
    }, []);

    const handleEditServant = useCallback((planServant: Immutable<PlanServant>): void => {
        openEditServantDialog(planServant);
    }, [openEditServantDialog]);


    const handleAddServantButtonClick = useCallback((): void => {
        openEditServantDialog();
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
         * If a new servant is being added, then `editServantTargetRef.current` will be
         * undefined. Conversely, if an existing servant is being edited, then
         * `editServantTargetRef.current` should be defined.
         */
        if (!editServantTargetRef.current) {
            planServants.push(data.planServant);
        } else {
            // TODO Compare objects and just close dialog if there are no changes.
            /*
             * Re-build the servant object to force its row to re-render.
             */
            const index = planServants.indexOf(editServantTargetRef.current as PlanServant);
            if (index !== -1) {
                planServants[index] = { ...editServantTarget! };
            }
        }

        plan.servants = [...planServants]; // Forces child list to re-render

        setDirty(true);
        closeEditServantDialog();
        computePlanRequirements();
        // updateSelectedServants();
    }, [closeEditServantDialog, computePlanRequirements, editServantTarget]);

    //#endregion

    const deleteServantDialogPrompt = useMemo((): string | undefined => {
        if (!deleteServantTarget || !gameServantMap || !masterAccount) {
            return undefined;
        }
        const { instanceId } = deleteServantTarget;
        const masterServant = masterAccount.servants.find(servant => servant.instanceId === instanceId);
        if (!masterServant) {
            return undefined;
        }
        const { gameId } = masterServant;
        const servant = gameServantMap[gameId];
        return `Are you sure you want to remove ${servant?.name} from the servant list?`;
    }, [deleteServantTarget, gameServantMap, masterAccount]);

    /**
     * These can be undefined during the initial render.
     *
     * Note that `planRequirementsRef.current` is computed from `planRef.current`,
     * which itself is a clone of `plan`. Thus, if `planRequirementsRef.current` is
     * defined, then so will the other two.
     */
    if (!gameServantMap || !masterAccount || !planRequirementsRef.current) {
        return null;
    }
    /**
     * The clone of `plan`. As noted above, this cannot be undefined at this point.
     */
    const _plan = planRef.current!; // TODO Rename this

    /**
     * NavigationRail children
     */
    const navigationRailChildNodes: ReactNode = [
        <Tooltip key='add' title='Add servant' placement='right'>
            <div>
                <IconButton
                    onClick={handleAddServantButtonClick}
                    children={<AddIcon />}
                    size='large'
                />
            </div>
        </Tooltip>,
        <Tooltip key='test' title='Test' placement='right'>
            <div>
                <IconButton
                    onClick={handleToggleLayout}
                    children={<FormatSizeIcon />}
                    size='large'
                />
            </div>
        </Tooltip>,
        <Tooltip key='test2' title='Test 2' placement='right'>
        <div>
            <IconButton
                onClick={handleToggleShowUnused}
                children={<HideImageOutlinedIcon />}
                size='large'
            />
        </div>
    </Tooltip>,
    ];

    /**
     * FabContainer children
     */
    const fabContainerChildNodes: ReactNode = [
        <Tooltip key='revert' title='Revert changes'>
            <div>
                <Fab
                    color='default'
                    onClick={handleRevertButtonClick}
                    disabled={!dirty || !!loadingIndicatorIdRef.current}
                    children={<ClearIcon />}
                />
            </div>
        </Tooltip>,
        <Tooltip key='save' title='Save changes'>
            <div>
                <Fab
                    color='primary'
                    onClick={handleSaveButtonClick}
                    disabled={!dirty || !!loadingIndicatorIdRef.current}
                    children={<SaveIcon />}
                />
            </div>
        </Tooltip>
    ];

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className='flex justify-space-between align-center'>
                <PageTitle children={_plan.name} />
                {/* TODO Add button to edit plan details */}
            </div>
            <div className='flex overflow-hidden full-height'>
                <NavigationRail children={navigationRailChildNodes} />
                <div className={`${StyleClassPrefix}-main-content`}>
                    <LayoutPanelContainer
                        className='scrollbar-track-border'
                        autoHeight
                        children={
                            <PlanRequirementsTable
                                masterAccount={masterAccount}
                                plan={_plan}
                                planRequirements={planRequirementsRef.current!}
                                options={tableOptions}
                                onEditServant={handleEditServant}
                            />
                        }
                    />
                </div>
            </div>
            <FabContainer children={fabContainerChildNodes} />
            <PlanServantEditDialog
                open={!!editServantTarget}
                dialogTitle={`${!editServantTargetRef.current ? 'Add' : 'Edit'} Servant`}
                submitButtonLabel='Done'
                planServant={editServantTarget!}
                planServants={_plan.servants}
                masterServants={masterAccount.servants}
                unlockedCostumes={masterAccount.costumes}
                showAppendSkills={showAppendSkills}
                servantSelectDisabled={!!editServantTargetRef.current}
                onClose={handleEditServantDialogClose}
            />
        </Box>
    );

});

import { DateTimeUtils, Immutable, ImmutableArray, Nullable } from '@fgo-planner/common-core';
import { ImmutableMasterAccount, ImmutableMasterServant, ImmutablePlan, Plan, PlanServant, PlanUpcomingResources } from '@fgo-planner/data-core';
import { Add as AddIcon, FormatSize as FormatSizeIcon, HideImageOutlined as HideImageOutlinedIcon } from '@mui/icons-material';
import { IconButton, Theme, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import lodash from 'lodash-es';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PathPattern } from 'react-router';
import { useMatch, useNavigate } from 'react-router-dom';
import { RouteDataEditControls } from '../../../../components/control/route-data-edit-controls.component';
import { NavigationRail } from '../../../../components/navigation/navigation-rail/navigation-rail.component';
import { PlanRequirementsTableOptions } from '../../../../components/plan/requirements/table/plan-requirements-table-options.type';
import { PlanRequirementsTable } from '../../../../components/plan/requirements/table/plan-requirements-table.component';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useLoadingIndicator } from '../../../../hooks/user-interface/use-loading-indicator.hook';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { PlanService } from '../../../../services/data/plan/plan.service';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { PlanRequirements } from '../../../../types/data';
import { PlanComputationUtils } from '../../../../utils/plan/plan-computation.utils';
import { PlanServantUtils } from '../../../../utils/plan/plan-servant.utils';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { DialogData as PlanServantEditDialogData, PlanServantEditDialog } from '../../components/plan/servant/edit/plan-servant-edit-dialog.component';

const instantiateDefaultTableOptions = (): PlanRequirementsTableOptions => ({
    layout: {
        cells: 'normal',
        stickyColumn: 'normal'
    },
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

const PathMatchPattern: PathPattern = {
    path: '/user/master/planner/:id'
};

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
    masterServants: ReadonlyArray<ImmutableMasterServant>
): PlanServant => {
    /**
     * Servants that have not been added to the plan yet.
     */
    const availableServants = PlanServantUtils.findAvailableServants(planServants, masterServants);
    if (!availableServants.length) {
        throw new Error('No more servants available');
    }
    /**
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
const clonePlan = (plan: ImmutablePlan): Plan => {
    const targetDate = DateTimeUtils.cloneDate(plan.targetDate);
    const createdAt = DateTimeUtils.cloneDate(plan.createdAt);
    const updatedAt = DateTimeUtils.cloneDate(plan.updatedAt);
    return {
        ...plan,
        targetDate,
        enabled: {
            ...plan.enabled
        },
        servants: plan.servants.map(servant => PlanServantUtils.clone(servant)),
        upcomingResources: plan.upcomingResources.map(lodash.cloneDeep) as Array<PlanUpcomingResources>,
        createdAt,
        updatedAt
    };
};

const StyleClassPrefix = 'Plan';

const StyleProps = (theme: SystemTheme) => {

    const {
        breakpoints,
        palette,
        spacing
    } = theme as Theme;

    return {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        [`& .${StyleClassPrefix}-upper-layout-container`]: {

        },
        [`& .${StyleClassPrefix}-lower-layout-container`]: {
            display: 'flex',
            height: '100%',
            overflow: 'hidden',
            [`& .${StyleClassPrefix}-main-content`]: {
                display: 'flex',
                width: `calc(100% - ${spacing(ThemeConstants.NavigationRailSizeScale)})`,
                [`& .${StyleClassPrefix}-table-container`]: {
                    flex: 1,
                    overflow: 'hidden',
                    // [`& .${MasterServantListStyleClassPrefix}-root`]: {
                    //     borderRightWidth: 1,
                    //     borderRightStyle: 'solid',
                    //     borderRightColor: palette.divider
                    // }
                },
                [`& .${StyleClassPrefix}-info-panel-container`]: {
                    width: 320,
                    height: 'calc(100% - 84px)',
                    pr: 4,
                    py: 4,
                    boxSizing: 'border-box',
                    [breakpoints.down('xl')]: {
                        width: 300
                    }
                }
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const PlanRoute = React.memo(() => {

    const routeMatch = useMatch<'id', string>(PathMatchPattern);
    const planId = routeMatch?.params.id;

    const forceUpdate = useForceUpdate();
    const navigate = useNavigate();

    const {
        invokeLoadingIndicator,
        resetLoadingIndicator,
        isLoadingIndicatorActive
    } = useLoadingIndicator();

    const planService = useInjectable(PlanService);

    const gameServantMap = useGameServantMap();

    const [masterAccount, setMasterAccount] = useState<Nullable<ImmutableMasterAccount>>();
    
    /**
     * The plan data loaded from the backend. This should not be modified or used
     * anywhere in this route, except when reverting changes. Use `planRef` instead.
     */
    const [plan, setPlan] = useState<ImmutablePlan>();
    /**
     * Contains a clone of the currently loaded `Plan` object.
     *
     * The data is cloned to avoid unwanted modification of the original data. In
     * addition, the data is stored as a ref to prevent unwanted triggering of hooks
     * on change.
     */
    const planRef = useRef<Plan>();

    /**
     * Whether the user has made any unsaved changes.
     */
    const [dirty, setDirty] = useState<boolean>(false); // TODO Rename this

    const [showAppendSkills, setShowAppendSkills] = useState<boolean>(true); // TODO Change this back to false
    const [tableOptions, setTableOptions] = useState<PlanRequirementsTableOptions>(instantiateDefaultTableOptions);

    /**
     * Clone of the servant that is being edited by the servant edit dialog. This
     * data is passed directly into and modified by the dialog. The original data is
     * not modified until the changes are submitted.
     */
    const [editServantTarget, setEditServantTarget] = useState<PlanServant>();
    /**
     * Reference to the original data of the servant that is being edited.
     *
     * When adding a new servant, this will remain `undefined`.
     */
    const editServantTargetRef = useRef<Immutable<PlanServant>>();
    // const [editServantDialogOpen, setEditServantDialogOpen] = useState<boolean>(false);

    const [deleteServantTarget, setDeleteServantTarget] = useState<PlanServant>();
    const [deleteServantDialogOpen, setDeleteServantDialogOpen] = useState<boolean>(false);

    const planRequirementsRef = useRef<PlanRequirements>();

    const computePlanRequirements = useCallback(() => {
        /**
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
        /**
         * Force update is needed here because if the plan loads in after the other data
         * (servant map and master account data), then the component wont be re-rendered
         * after requirements are computed.
         */
        forceUpdate();
    }, [forceUpdate, gameServantMap, masterAccount, plan]);

    /**
     * Initial load of plan data.
     */
    useEffect(() => {
        if (!planId) {
            console.error('Could not parse plan ID from route.');
        } else {
            invokeLoadingIndicator();
            const loadPlan = async (): Promise<void> => {
                const plan = await planService.getPlan(planId);
                // TODO Sanitize plan against current master account data.
                planRef.current = clonePlan(plan);
                setPlan(plan);
                resetLoadingIndicator();
            };
            loadPlan();
        }
    }, [invokeLoadingIndicator, planId, planService, resetLoadingIndicator]);

    /**
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
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
        invokeLoadingIndicator();

        editServantTargetRef.current = undefined;
        setEditServantTarget(undefined);
        setDeleteServantTarget(undefined);
        setDeleteServantDialogOpen(false);

        try {
            /**
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

    }, [computePlanRequirements, invokeLoadingIndicator, plan, planService, resetLoadingIndicator]);


    //#region Input event handlers

    const handleToggleCellSize = useCallback((): void => {
        const layout = { ...tableOptions.layout };
        layout.cells = layout.cells === 'condensed' ? 'normal' : 'condensed';
        setTableOptions({
            ...tableOptions,
            layout
        });
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
            /**
             * Adding a planned servant.
             */
            /** */
            const plan = planRef.current!;
            const editServantTarget = instantiatePlanServant(plan.servants, masterAccount!.servants);
            editServantTargetRef.current = undefined;
            setEditServantTarget(editServantTarget);
        } else {
            /**
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
        /**
         * Close the dialog without taking any further action if the changes were
         * cancelled (if `data` is undefined, then the changes were cancelled).
         */
        if (!data) {
            return closeEditServantDialog();
        }

        const plan = planRef.current!; // Not possible to be null here.
        const planServants = plan.servants;

        /**
         * If a new servant is being added, then `editServantTargetRef.current` will be
         * undefined. Conversely, if an existing servant is being edited, then
         * `editServantTargetRef.current` should be defined.
         */
        if (!editServantTargetRef.current) {
            planServants.push(data.planServant);
        } else {
            /**
             * TODO Compare objects and just close dialog if there are no changes.
             * 
             * Re-build the servant object to force its row to re-render.
             */
            /** */
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

    /**
     * TODO This is temporary...will need some changes (delete prompt dialog, etc.)
     */
    const handleDeleteServant = useCallback((planServant: Immutable<PlanServant>): void => {
        const plan = planRef.current!; // Not possible to be null here.
        const planServants = plan.servants;
        plan.servants = planServants.filter(servant => servant !== planServant); // Forces child list to re-render

        setDirty(true);
        computePlanRequirements();
    }, [computePlanRequirements]);

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
                    onClick={handleToggleCellSize}
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

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-upper-layout-container`}>
                <RouteDataEditControls
                    title={_plan.name}
                    hasUnsavedData={dirty}
                    onRevertButtonClick={handleRevertButtonClick}
                    onSaveButtonClick={handleSaveButtonClick}
                    disabled={isLoadingIndicatorActive}
                />
            </div>
            <div className={`${StyleClassPrefix}-lower-layout-container`}>
                <NavigationRail children={navigationRailChildNodes} border />
                <div className={`${StyleClassPrefix}-main-content`}>
                    <div className={clsx(`${StyleClassPrefix}-table-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                        <PlanRequirementsTable
                            masterAccount={masterAccount}
                            plan={_plan}
                            planRequirements={planRequirementsRef.current!}
                            options={tableOptions}
                            onDeleteServant={handleDeleteServant}
                            onEditServant={handleEditServant}
                        />
                    </div>
                </div>
            </div>
            <PlanServantEditDialog
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

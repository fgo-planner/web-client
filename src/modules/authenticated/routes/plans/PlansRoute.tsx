import { ImmutableBasicPlan, ImmutableBasicPlanGroup, Plan } from '@fgo-planner/data-core';
import { Button, IconButton, PaperProps, TextField, Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PromptDialog } from '../../../../components/dialog/prompt-dialog.component';
import { IconOutlined } from '../../../../components/icons';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/use-active-breakpoints.hook';
import { useLoadingIndicator } from '../../../../hooks/user-interface/use-loading-indicator.hook';
import { PlanService } from '../../../../services/data/plan/plan.service';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { BasicPlans, ModalOnCloseReason, PlanType } from '../../../../types';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { PlansRouteCreatePlanDialog } from './components/PlansRouteCreatePlanDialog';
import { PlansRouteNavigationRail } from './components/PlansRouteNavigationRail';
import { PlansRoutePlanList } from './components/PlansRoutePlanList';
import { PlansRoutePlanListVisibleColumns } from './components/PlansRoutePlanListColumn.type';

const AddPlanDialogPaperProps: PaperProps = {
    style: {
        minWidth: 360
    }
};

const DeleteTargetDialogTitle = 'Delete Plan?';

const generateDeleteTargetDialogPrompt = (target: ImmutableBasicPlan | ImmutableBasicPlanGroup): string => {
    const { name } = target;
    let prompt = 'Are you sure you want to delete';
    if (name) {
        return `${prompt} '${name}'?`;
    } else {
        return `${prompt} the plan?`;
    }
};

const StyleClassPrefix = 'Plans';

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
            '&>div': {
                display: 'flex',
                alignItems: 'center',
                minHeight: '4rem',
                height: '4rem',
                borderBottomWidth: 1,
                borderBottomStyle: 'solid',
                borderBottomColor: palette.divider
            },
            [`& .${StyleClassPrefix}-title-row`]: {
                justifyContent: 'space-between',
                pr: 4,
                [`& .${StyleClassPrefix}-title`]: {
                    pb: 4
                },
                [breakpoints.down('sm')]: {
                    pr: 3
                }
            },
            [`& .${StyleClassPrefix}-filter-controls`]: {
                '& .MuiTextField-root': {
                    width: spacing(64),  // 256px
                    ml: 14,
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: palette.background.paper
                    },
                    [breakpoints.down('sm')]: {
                        width: spacing(48),  // 192px
                        ml: 4
                    }
                }
            }
        },
        [`& .${StyleClassPrefix}-lower-layout-container`]: {
            display: 'flex',
            height: '100%',
            overflow: 'hidden',
            [`& .${StyleClassPrefix}-list-container`]: {
                flex: 1,
                overflow: 'hidden'
            },
            [breakpoints.down('sm')]: {
                flexDirection: 'column',
                [`& .${StyleClassPrefix}-main-content`]: {
                    width: '100%',
                    height: `calc(100% - ${spacing(ThemeConstants.NavigationRailSizeScale)})`
                }
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

// TODO Implement sorting
// TODO Implement configurable column visibility
// TODO Implement filter/search
// TODO Add pagination
// TODO Implement plan grouping (maybe display each group as a folder that can be navigated into).
// TODO Maybe add info panel
// TODO Maybe implement drag-drop
// TODO Implement multi-select
// TODO Add context menus

export const PlansRoute = React.memo(() => {

    const {
        invokeLoadingIndicator,
        resetLoadingIndicator
    } = useLoadingIndicator();

    const navigate = useNavigate();

    const planService = useInjectable(PlanService);

    const [accountPlans, setAccountPlans] = useState<BasicPlans>();

    const [selectedId, setSelectedId] = useState<string>();
    const selectedRef = useRef<{ type: PlanType; target: ImmutableBasicPlan | ImmutableBasicPlanGroup; }>();

    const [addPlanDialogOpen, setAddPlanDialogOpen] = useState<boolean>(false);

    const [deleteTargetDialogPrompt, setDeleteTargetDialogPrompt] = useState<string>();

    // TODO Load/save this from user preferences
    const [filtersEnabled, setFiltersEnabled] = useState<boolean>(false);

    const masterAccountIdRef = useRef<string>();

    const loadPlansForAccount = useCallback(async () => {
        const masterAccountId = masterAccountIdRef.current;
        if (!masterAccountId) {
            return setAccountPlans(undefined);
        }
        invokeLoadingIndicator();

        setSelectedId(undefined);
        selectedRef.current = undefined;
        setAddPlanDialogOpen(false);
        setDeleteTargetDialogPrompt(undefined);

        try {
            const accountPlans = await planService.getForAccount(masterAccountId);
            setAccountPlans(accountPlans);
        } catch (e) {
            // TODO Handle error
        }
        resetLoadingIndicator();
    }, [invokeLoadingIndicator, planService, resetLoadingIndicator]);

    /*
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(masterAccount => {
                const masterAccountId = masterAccount?._id;
                if (masterAccountId !== masterAccountIdRef.current) {
                    masterAccountIdRef.current = masterAccountId;
                    loadPlansForAccount();
                }
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, [loadPlansForAccount]);

    const { sm, lg } = useActiveBreakpoints();

    const visibleColumns = useMemo((): PlansRoutePlanListVisibleColumns => ({
        name: true,
        created: lg,
        modified: lg,
        description: sm
    }), [lg, sm]);

    const handleAddPlan = useCallback((): void => {
        setAddPlanDialogOpen(true);
    }, []);

    const handleAddPlanDialogClose = useCallback((event: any, reason: ModalOnCloseReason, data?: Plan): void => {
        setAddPlanDialogOpen(false);
        if (reason === 'submit') {
            loadPlansForAccount();
        }
    }, [loadPlansForAccount]);

    const handleOpenEditTargetDialog = useCallback((): void => {
        if (!selectedRef.current) {
            return;
        }
        // TODO Implement this
    }, []);

    const handleOpenDeleteTargetDialog = useCallback((): void => {
        if (!accountPlans || !selectedId) {
            return;
        }
        // TODO Include planGroups
        const plan = accountPlans.plans.find(plan => plan._id === selectedId);
        if (!plan) {
            console.warn(`Could not find plan id=${selectedId}`);
            return;
        }
        const prompt = generateDeleteTargetDialogPrompt(plan);
        setDeleteTargetDialogPrompt(prompt);
    }, [accountPlans, selectedId]);

    const handleDeleteTargetDialogClose = useCallback(async (event: any, reason: ModalOnCloseReason): Promise<void> => {
        if (!selectedId) {
            return;
        }
        if (reason === 'submit') {
            try {
                await planService.deletePlan(selectedId);
                loadPlansForAccount();
            } catch (e) {
                console.error(e);
            }
        }
        setDeleteTargetDialogPrompt(undefined);
    }, [loadPlansForAccount, planService, selectedId]);

    // TODO move this to user preferences hook
    const toggleFilters = useCallback(() => {
        setFiltersEnabled(filtersEnabled => !filtersEnabled);
    }, []);


    //#region Plan list event handlers

    const handleRowClick = useCallback((e: MouseEvent): void => {
        if (e.type === 'contextmenu') {
            // TODO Open context menu
        }
    }, []);

    const handleRowDoubleClick = useCallback((): void => {
        if (!selectedRef.current || selectedRef.current.type === 'group') {
            return;
        }
        const planId = selectedRef.current.target._id!;
        navigate(planId);
    }, [navigate]);

    const handleSelectionChange = useCallback((target: ImmutableBasicPlan | ImmutableBasicPlanGroup | undefined, type: PlanType): void => {
        if (!target) {
            selectedRef.current = undefined;
        } else {
            selectedRef.current = { type, target };
        }
        setSelectedId(target?._id);
    }, []);

    //#endregion


    return <>
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-upper-layout-container`}>
                <div className={`${StyleClassPrefix}-title-row`}>
                    <PageTitle className={`${StyleClassPrefix}-title`}>
                        Plans
                    </PageTitle>
                    {sm ?
                        <Button variant='contained' onClick={handleAddPlan}>
                            Create Plan
                        </Button> :
                        <IconButton color='primary' onClick={handleAddPlan}>
                            <IconOutlined>post_add</IconOutlined>
                        </IconButton>
                    }
                </div>
                {/* TODO Create a separate component for this */}
                {filtersEnabled && <div className={`${StyleClassPrefix}-filter-controls`}>
                    <TextField
                        variant='outlined'
                        label='Search'
                        size='small'
                    />
                </div>}
            </div>
            <div className={`${StyleClassPrefix}-lower-layout-container`}>
                <PlansRouteNavigationRail
                    filtersEnabled={filtersEnabled}
                    layout={sm ? 'column' : 'row'}
                    hasSelection={!!selectedRef.current}
                    onAddPlan={handleAddPlan}
                    onEditSelectedPlan={handleOpenEditTargetDialog}
                    onDeleteSelectedPlan={handleOpenDeleteTargetDialog}
                    onToggleFilters={toggleFilters}
                />
                <div className={clsx(`${StyleClassPrefix}-list-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                    {accountPlans &&
                        <PlansRoutePlanList
                            accountPlans={accountPlans}
                            visibleColumns={visibleColumns}
                            selectedId={selectedId}
                            onRowClick={handleRowClick}
                            onRowDoubleClick={handleRowDoubleClick}
                            onSelectionChange={handleSelectionChange}
                        />
                    }
                </div>
            </div>
        </Box>
        <PlansRouteCreatePlanDialog
            open={addPlanDialogOpen}
            PaperProps={AddPlanDialogPaperProps}
            masterAccountId={masterAccountIdRef.current}
            onClose={handleAddPlanDialogClose}
        />
        <PromptDialog
            open={!!deleteTargetDialogPrompt}
            title={DeleteTargetDialogTitle}
            prompt={deleteTargetDialogPrompt}
            cancelButtonColor='secondary'
            confirmButtonColor='primary'
            confirmButtonLabel='Delete'
            onClose={handleDeleteTargetDialogClose}
        />
    </>;
});

import { Plan } from '@fgo-planner/types';
import { PostAddOutlined } from '@mui/icons-material';
import { Button, IconButton, PaperProps, TextField, Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PromptDialog } from '../../../../components/dialog/prompt-dialog.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/use-active-breakpoints.hook';
import { useLoadingIndicator } from '../../../../hooks/user-interface/use-loading-indicator.hook';
import { PlanService } from '../../../../services/data/plan/plan.service';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { MasterAccountPlans } from '../../../../types/data';
import { Immutable, ModalOnCloseReason } from '../../../../types/internal';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { PlanAddDialog } from './components/plan-add-dialog.component';
import { PlanListVisibleColumns } from './components/plan-list-columns';
import { PlanList } from './components/plan-list.component';
import { PlansNavigationRail } from './components/plans-navigation-rail.component';

const AddPlanDialogPaperProps: PaperProps = {
    style: {
        minWidth: 360
    }
};

const DeletePlanDialogTitle = 'Delete Plan?';

const generateDeletePlanDialogPrompt = (plan: Immutable<Partial<Plan>> | undefined): string => {
    if (!plan) {
        return '';
    }
    const { name } = plan;
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
// TODO Maybe add info panel

export const PlansRoute = React.memo(() => {

    const {
        invokeLoadingIndicator,
        resetLoadingIndicator,
        isLoadingIndicatorActive
    } = useLoadingIndicator();

    const planService = useInjectable(PlanService);

    const [accountPlans, setAccountPlans] = useState<MasterAccountPlans>();

    const [addPlanDialogOpen, setAddPlanDialogOpen] = useState<boolean>(false);
    const [deletePlanDialogOpen, setDeletePlanDialogOpen] = useState<boolean>(false);
    const [deletePlanTarget, setDeletePlanTarget] = useState<Immutable<Partial<Plan>>>();

    // TODO Load/save this from user preferences
    const [filtersEnabled, setFiltersEnabled] = useState<boolean>(false);

    const masterAccountIdRef = useRef<string>();

    const loadPlansForAccount = useCallback(async () => {
        const masterAccountId = masterAccountIdRef.current;
        if (!masterAccountId) {
            return setAccountPlans(undefined);
        }
        invokeLoadingIndicator();

        setAddPlanDialogOpen(false);
        setDeletePlanDialogOpen(false);
        setDeletePlanTarget(undefined);

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

    const visibleColumns = useMemo((): PlanListVisibleColumns => ({
        name: true,
        created: lg,
        modified: lg,
        description: sm
    }), [lg, sm]);

    const deletePlanDialogPrompt = useMemo(() => generateDeletePlanDialogPrompt(deletePlanTarget), [deletePlanTarget]);

    const handleAddPlan = useCallback((): void => {
        setAddPlanDialogOpen(true);
    }, []);

    const handleAddPlanDialogClose = useCallback((event: any, reason: ModalOnCloseReason, data?: Plan): void => {
        setAddPlanDialogOpen(false);
        if (reason === 'submit') {
            loadPlansForAccount();
        }
    }, [loadPlansForAccount]);

    const handleDeletePlan = useCallback((plan: Immutable<Partial<Plan>>): void => {
        setDeletePlanTarget(plan);
        setDeletePlanDialogOpen(true);
    }, []);

    const handleDeletePlanDialogClose = useCallback(async (event: any, reason: ModalOnCloseReason): Promise<void> => {
        if (reason === 'submit') {
            try {
                await planService.deletePlan(deletePlanTarget?._id!!);
                loadPlansForAccount();
            } catch (e) {
                console.error(e);
            }
        }
        setDeletePlanTarget(undefined);
        setDeletePlanDialogOpen(false);
    }, [deletePlanTarget?._id, loadPlansForAccount, planService]);

    const toggleFilters = useCallback(() => {
        setFiltersEnabled(filtersEnabled => !filtersEnabled);
    }, []);

    return <>
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-upper-layout-container`}>
                <div className={`${StyleClassPrefix}-title-row`}>
                    <PageTitle className={`${StyleClassPrefix}-title`}>
                        My Plans
                    </PageTitle>
                    {sm ?
                        <Button variant='contained' onClick={handleAddPlan}>
                            Create Plan
                        </Button> :
                        <IconButton color='primary' onClick={handleAddPlan}>
                            <PostAddOutlined />
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
                <PlansNavigationRail
                    filtersEnabled={filtersEnabled}
                    layout={sm ? 'column' : 'row'}
                    onAddPlan={handleAddPlan}
                    onToggleFilters={toggleFilters}
                />
                <div className={clsx(`${StyleClassPrefix}-list-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                    {accountPlans &&
                        <PlanList
                            accountPlans={accountPlans}
                            visibleColumns={visibleColumns}
                        />
                    }
                </div>
            </div>
        </Box>
        <PlanAddDialog
            open={addPlanDialogOpen}
            PaperProps={AddPlanDialogPaperProps}
            masterAccountId={masterAccountIdRef.current}
            onClose={handleAddPlanDialogClose}
        />
        <PromptDialog
            open={deletePlanDialogOpen}
            title={DeletePlanDialogTitle}
            prompt={deletePlanDialogPrompt}
            cancelButtonColor='secondary'
            confirmButtonColor='primary'
            confirmButtonLabel='Delete'
            onClose={handleDeletePlanDialogClose}
        />
    </>;
});

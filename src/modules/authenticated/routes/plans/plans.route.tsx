import { Plan } from '@fgo-planner/types';
import { Add as AddIcon } from '@mui/icons-material';
import { Fab, PaperProps, Tooltip } from '@mui/material';
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PromptDialog } from '../../../../components/dialog/prompt-dialog.component';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { LayoutContentSection } from '../../../../components/layout/layout-content-section.component';
import { AppBarElevateOnScroll } from '../../../../components/navigation/app-bar/app-bar-elevate-on-scroll.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useLoadingIndicator } from '../../../../hooks/user-interface/use-loading-indicator.hook';
import { PlanService } from '../../../../services/data/plan/plan.service';
import { MasterAccountPlans } from '../../../../types/data';
import { Immutable, ModalOnCloseReason } from '../../../../types/internal';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { PlanAddDialog } from './plan-add-dialog';
import { PlanList } from './plan-list.component';

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

    const deletePlanDialogPrompt = useMemo(() => generateDeletePlanDialogPrompt(deletePlanTarget), [deletePlanTarget]);

    const handleAddPlanButtonClick = useCallback((): void => {
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

    return (
        <Fragment>
            <AppBarElevateOnScroll>
                <PageTitle>
                    My Plans
                </PageTitle>
                <LayoutContentSection className='p-4'>
                    {!!accountPlans ?
                        <PlanList
                            accountPlans={accountPlans}
                            onDeletePlan={handleDeletePlan}
                        /> :
                        <div>
                            No plans found
                        </div>
                    }
                </LayoutContentSection>
                <div className='py-10' />
            </AppBarElevateOnScroll>
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
            <FabContainer>
                <Tooltip key='add' title='Create new plan'>
                    <div>
                        <Fab
                            color='primary'
                            onClick={handleAddPlanButtonClick}
                            disabled={isLoadingIndicatorActive}
                            children={<AddIcon />}
                        />
                    </div>
                </Tooltip>
            </FabContainer>
        </Fragment>
    );
});

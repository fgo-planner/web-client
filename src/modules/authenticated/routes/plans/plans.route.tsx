import { Plan, PlanGroup } from '@fgo-planner/types';
import { Fab, PaperProps, Tooltip } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PromptDialog } from '../../../../components/dialog/prompt-dialog.component';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { LayoutPageScrollable } from '../../../../components/layout/layout-page-scrollable.component';
import { LayoutPanelContainer } from '../../../../components/layout/layout-panel-container.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useElevateAppBarOnScroll } from '../../../../hooks/user-interface/use-elevate-app-bar-on-scroll.hook';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { AccountPlans, PlannerService } from '../../../../services/data/planner/planner.service';
import { LoadingIndicatorOverlayService } from '../../../../services/user-interface/loading-indicator-overlay.service';
import { ModalOnCloseReason, ReadonlyPartial, ReadonlyPartialArray } from '../../../../types/internal';
import { PlanAddDialog } from './plan-add-dialog';
import { PlanList } from './plan-list.component';

const AddPlanDialogPaperProps: PaperProps = {
    style: {
        minWidth: 360
    }
};

const DeletePlanDialogTitle = 'Delete Plan?';

const generateDeletePlanDialogPrompt = (plan: ReadonlyPartial<Plan> | undefined): string => {
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

    const masterAccountIdRef = useRef<string>();
    const [accountPlans, setAccountPlans] = useState<AccountPlans>();
    const [addPlanDialogOpen, setAddPlanDialogOpen] = useState<boolean>(false);
    const [deletePlanDialogOpen, setDeletePlanDialogOpen] = useState<boolean>(false);
    const [deletePlanTarget, setDeletePlanTarget] = useState<ReadonlyPartial<Plan>>();
    const [loadingIndicatorId, setLoadingIndicatorId] = useState<string>();

    const loadPlansForAccount = useCallback(async () => {
        const masterAccountId = masterAccountIdRef.current;
        if (!masterAccountId) {
            return setAccountPlans(undefined);
        }
        let _loadingIndicatorId = loadingIndicatorId;
        if (!_loadingIndicatorId) {
            _loadingIndicatorId = LoadingIndicatorOverlayService.invoke();
        }
        setAddPlanDialogOpen(false);
        setDeletePlanDialogOpen(false);
        setDeletePlanTarget(undefined);
        setLoadingIndicatorId(_loadingIndicatorId);

        try {
            const accountPlans = await PlannerService.getForAccount(masterAccountId);
            LoadingIndicatorOverlayService.waive(_loadingIndicatorId);
            setAccountPlans(accountPlans);
            setLoadingIndicatorId(undefined);
        } catch (e) {
            // TODO Handle error
        }
    }, [loadingIndicatorId]);

    /*
     * Master account subscriptions. Unfortunately, due to the way React hooks
     * work, this will unsubscribe and then re-subscribe to the subject every time
     * the `loadingIndicatorId` state is changed.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = MasterAccountService.onCurrentMasterAccountChange
            .subscribe(masterAccount => {
                const masterAccountId = masterAccount?._id;
                if (masterAccountId !== masterAccountIdRef.current) {
                    masterAccountIdRef.current = masterAccountId;
                    loadPlansForAccount();
                }
            });

        return () => {
            onCurrentMasterAccountChangeSubscription.unsubscribe();
        };
    }, [loadPlansForAccount]);

    const scrollContainer = useElevateAppBarOnScroll();

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

    const handleDeletePlan = useCallback((plan: ReadonlyPartial<Plan>): void => {
        setDeletePlanTarget(plan);
        setDeletePlanDialogOpen(true);
    }, []);

    const handleDeletePlanDialogClose = useCallback(async (event: any, reason: ModalOnCloseReason): Promise<void> => {
        if (reason === 'submit') {
            try {
                await PlannerService.deletePlan(deletePlanTarget?._id!!);
                loadPlansForAccount();
            } catch (e) {
                console.error(e);
            }
        }
        setDeletePlanTarget(undefined);
        setDeletePlanDialogOpen(false);
    }, [deletePlanTarget, loadPlansForAccount]);

    return (
        <Fragment>
            <LayoutPageScrollable scrollContainerRef={scrollContainer}>
                <PageTitle>
                    My Plans
                </PageTitle>
                <LayoutPanelContainer className="p-4">
                    {!!accountPlans ?
                        <PlanList
                            accountPlans={accountPlans}
                            onDeletePlan={handleDeletePlan}
                        /> :
                        <div>
                            No plans found
                        </div>
                    }
                </LayoutPanelContainer>
                <div className="py-10" />
            </LayoutPageScrollable>
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
                cancelButtonColor="secondary"
                confirmButtonColor="primary"
                confirmButtonLabel="Delete"
                onClose={handleDeletePlanDialogClose}
            />
            <FabContainer>
                <Tooltip key="add" title="Create new plan">
                    <div>
                        <Fab
                            color="primary"
                            onClick={handleAddPlanButtonClick}
                            disabled={!!loadingIndicatorId}
                            children={<AddIcon />}
                        />
                    </div>
                </Tooltip>
            </FabContainer>
        </Fragment>
    );
});

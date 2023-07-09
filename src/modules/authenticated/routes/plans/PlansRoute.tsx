import { Immutable } from '@fgo-planner/common-core';
import { BasicPlan, PlanGroup, PlanGroupAggregatedData } from '@fgo-planner/data-core';
import { Button, IconButton, TextField, Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PromptDialog } from '../../../../components/dialog/PromptDialog';
import { IconOutlined } from '../../../../components/icons/IconOutlined';
import { PageTitle } from '../../../../components/text/PageTitle';
import { PlanConstants } from '../../../../constants';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/useActiveBreakpoints';
import { ThemeConstants } from '../../../../styles/ThemeConstants';
import { ModalOnCloseReason } from '../../../../types';
import { PlanListItem } from './components/PlanListItem.type';
import { PlansRouteNavigationRail } from './components/PlansRouteNavigationRail';
import { PlansRoutePlanEditDialog } from './components/PlansRoutePlanEditDialog';
import { PlansRoutePlanList } from './components/PlansRoutePlanList';
import { PlansRoutePlanListColumn } from './components/PlansRoutePlanListColumn';
import { usePlansDataEdit } from './hooks/usePlansDataEdit';
import { usePlansRouteModalState } from './hooks/usePlansRouteModalState';

const DeleteTargetDialogTitle = 'Delete Plan?';

const generateDeleteTargetDialogPrompt = (target: Immutable<BasicPlan | PlanGroup>): string => {
    // const { name } = target;
    // let prompt = 'Are you sure you want to delete';
    // if (name) {
    //     return `${prompt} '${name}'?`;
    // } else {
    //     return `${prompt} the plan?`;
    // }
    return 'FIXME';
};

const isPlanGroup = (item: PlanListItem): item is PlanGroupAggregatedData => {
    return !!(item as PlanGroupAggregatedData).plans;
};

const isUngroupedPlanGroup = (item: PlanListItem): item is typeof PlanConstants.UngroupedGroupId => {
    return typeof item === 'string';
};

const StyleClassPrefix = 'PlansRoute';

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

    const navigate = useNavigate();

    const {
        planGroupingAggregatedData,
        createPlan,
        deletePlans
    } = usePlansDataEdit();

    const [selectedId, setSelectedId] = useState<string>();
    const selectedRef = useRef<PlanListItem>();

    const [deleteTargetDialogPrompt, setDeleteTargetDialogPrompt] = useState<string>();

    const {
        activeContextMenu,
        activeDialog,
        contextMenuPosition,
        closeActiveContextMenu,
        closeActiveDialog,
        openHeaderContextMenu,
        openPlanDeleteDialog,
        openPlanEditDialog,
        openPlanGroupRowContextMenu,
        openPlanRowContextMenu
    } = usePlansRouteModalState();

    // TODO Load/save this from user preferences
    const [filtersEnabled, setFiltersEnabled] = useState<boolean>(false);

    const { sm, lg } = useActiveBreakpoints();

    const visibleColumns = useMemo((): PlansRoutePlanListColumn.Visibility => ({
        name: true,
        created: lg,
        modified: lg,
        description: sm
    }), [lg, sm]);

    const handleCreatePlan = useCallback((): void => {
        openPlanEditDialog({ submitAction: createPlan });
    }, [createPlan, openPlanEditDialog]);

    const handleEditPlanDialogClose = useCallback((_event: any, _reason: ModalOnCloseReason): void => {
        closeActiveDialog();
    }, [closeActiveDialog]);

    const handleOpenEditTargetDialog = useCallback((): void => {
        if (!selectedRef.current) {
            return;
        }
        // TODO Implement this
    }, []);

    const handleOpenDeleteTargetDialog = useCallback((): void => {
        // if (!planList || !selectedId) {
        //     return;
        // }
        // // TODO Include planGroups
        // const plan = planMap.get(selectedId);
        // if (!plan) {
        //     console.warn(`Could not find plan id=${selectedId}`);
        //     return;
        // }
        // const prompt = generateDeleteTargetDialogPrompt(plan);
        // setDeleteTargetDialogPrompt(prompt);
    }, []);

    const handleDeleteTargetDialogClose = useCallback(async (event: any, reason: ModalOnCloseReason): Promise<void> => {
        if (reason === 'submit' && selectedId) {
            try {
                await deletePlans(selectedId);
            } catch (e) {
                console.error(e);
            }
        }
        setDeleteTargetDialogPrompt(undefined);
    }, [deletePlans, selectedId]);

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
        const target = selectedRef.current;
        if (!target || isPlanGroup(target) || isUngroupedPlanGroup(target)) {
            return;
        }
        const planId = target._id!;
        navigate(planId);
    }, [navigate]);

    const handleSelectionChange = useCallback((target: PlanListItem | undefined): void => {
        if (!target) {
            selectedRef.current = undefined;
            setSelectedId(undefined);
        } else {
            selectedRef.current = target;
            if (isUngroupedPlanGroup(target)) {
                // The ungrouped group is not allowed to be selected.
                return;
            }
            setSelectedId(target._id);
        }
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
                        <Button variant='contained' onClick={handleCreatePlan}>
                            Create Plan
                        </Button> :
                        <IconButton color='primary' onClick={handleCreatePlan}>
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
                    onCreatePlan={handleCreatePlan}
                    onCreatePlanGroup={handleCreatePlan}
                    onEditSelectedPlan={handleOpenEditTargetDialog}
                    onDeleteSelectedPlan={handleOpenDeleteTargetDialog}
                    onToggleFilters={toggleFilters}
                />
                <div className={clsx(`${StyleClassPrefix}-list-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                    {planGroupingAggregatedData &&
                        <PlansRoutePlanList
                            planGrouping={planGroupingAggregatedData}
                            selectedId={selectedId}
                            visibleColumns={visibleColumns}
                            onRowClick={handleRowClick}
                            onRowDoubleClick={handleRowDoubleClick}
                            onSelectionChange={handleSelectionChange}
                        />
                    }
                </div>
            </div>
        </Box>
        <PlansRoutePlanEditDialog
            dialogData={activeDialog.name === 'planEdit' ? activeDialog.data : undefined}
            onClose={handleEditPlanDialogClose}
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

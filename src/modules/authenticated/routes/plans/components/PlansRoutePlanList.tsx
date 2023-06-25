import { Immutable } from '@fgo-planner/common-core';
import { BasicPlan, PlanGroupAggregatedData, PlanGroupingAggregatedData } from '@fgo-planner/data-core';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { MouseEvent, MouseEventHandler, ReactNode, useCallback, useState } from 'react';
import { PlanConstants } from '../../../../../constants';
import { SortDirection } from '../../../../../types';
import { PlanListItem } from './PlanListItem.type';
import { PlansRoutePlanListColumn } from './PlansRoutePlanListColumn';
import { PlanGroupItem, PlansRoutePlanListGroupRow } from './PlansRoutePlanListGroupRow';
import { PlansRoutePlanListHeader } from './PlansRoutePlanListHeader';
import { StyleClassPrefix as GroupRowStyleClassPrefix } from './PlansRoutePlanListGroupRow';
import { PlansRoutePlanListRow, StyleClassPrefix as RowStyleClassPrefix } from './PlansRoutePlanListRow';

type Props = {
    planGrouping: PlanGroupingAggregatedData;
    selectedId?: string;
    visibleColumns: Readonly<PlansRoutePlanListColumn.Visibility>;
    onHeaderClick?: MouseEventHandler;
    onRowClick: MouseEventHandler;
    onRowDoubleClick: MouseEventHandler;
    onSelectionChange(target: PlanListItem): void;
    onSortChange?(column?: PlansRoutePlanListColumn.Name, direction?: SortDirection): void;
};

const DefaultExpandedGroups = new Set<string>([PlanConstants.UngroupedGroupId]);

const StyleClassPrefix = 'PlansRoutePlanList';

const ListRowHeight = 52;

const StyleProps = (theme: SystemTheme) => {

    const {
        breakpoints,
        palette
    } = theme as Theme;

    return {
        backgroundColor: palette.background.paper,
        flex: 1,
        height: '100%',
        overflow: 'auto',
        [`& .${StyleClassPrefix}-list-container`]: {
            display: 'flex',
            flexDirection: 'column',
            minWidth: 'fit-content',
            [`& .${RowStyleClassPrefix}-root`]: {
                height: ListRowHeight,
                px: 4,
                display: 'flex',
                alignItems: 'center',
                '>div': {
                    boxSizing: 'border-box',
                    px: 2
                },
                [`& .${RowStyleClassPrefix}-name`]: {
                    width: PlansRoutePlanListColumn.Properties.name.width,
                    ml: 10,
                    [breakpoints.down('sm')]: {
                        width: '100%',
                        px: 0
                    }
                },
                [`& .${RowStyleClassPrefix}-created`]: {
                    width: PlansRoutePlanListColumn.Properties.created.width,
                    textAlign: 'center'
                },
                [`& .${RowStyleClassPrefix}-modified`]: {
                    width: PlansRoutePlanListColumn.Properties.modified.width,
                    textAlign: 'center'
                },
                [`& .${RowStyleClassPrefix}-description`]: {
                    pl: 8
                },
                [`& .${RowStyleClassPrefix}-text`]: {
                    fontSize: '0.875rem'
                }
            },
            [`& .${GroupRowStyleClassPrefix}-root`]: {
                height: ListRowHeight,
                display: 'flex',
                alignItems: 'center',
                [`& .${GroupRowStyleClassPrefix}-icon`]: {
                    px: 4,
                    '& .MuiIcon-root': {
                        cursor: 'pointer'
                    }
                },
                [`& .${GroupRowStyleClassPrefix}-name`]: {
                    width: PlansRoutePlanListColumn.Properties.name.width,
                    fontWeight: 500,
                    [breakpoints.down('sm')]: {
                        width: '100%',
                        px: 0
                    }
                },
                [`& .${GroupRowStyleClassPrefix}-created`]: {
                    width: PlansRoutePlanListColumn.Properties.created.width,
                    textAlign: 'center'
                },
                [`& .${GroupRowStyleClassPrefix}-modified`]: {
                    width: PlansRoutePlanListColumn.Properties.modified.width,
                    textAlign: 'center'
                },
                [`& .${GroupRowStyleClassPrefix}-description`]: {
                    pl: 8
                },
                [`& .${GroupRowStyleClassPrefix}-text`]: {
                    fontSize: '0.875rem'
                }
            },
            [breakpoints.down('sm')]: {
                minWidth: 0
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const PlansRoutePlanList = React.memo((props: Props) => {

    const {
        planGrouping,
        selectedId,
        visibleColumns,
        onRowClick,
        onRowDoubleClick,
        onSelectionChange
    } = props;

    const [expandedGroups, setExpandedGroups] = useState<ReadonlySet<string>>(DefaultExpandedGroups);

    const handleRowClick = useCallback((event: MouseEvent, item: PlanListItem): void => {
        onSelectionChange(item);
        onRowClick(event);
    }, [onRowClick, onSelectionChange]);

    const handlePlanRowDoubleClick = useCallback((event: MouseEvent, plan: Immutable<BasicPlan>): void => {
        onSelectionChange(plan);
        onRowDoubleClick(event);
    }, [onRowDoubleClick, onSelectionChange]);

    const handlePlanListItemSelect = useCallback((_event: MouseEvent, item: PlanListItem): void => {
        onSelectionChange(item);
    }, [onSelectionChange]);

    const handlePlanGroupExpandToggle = useCallback((_event: MouseEvent, planGroup: PlanGroupItem): void => {
        const updatedExpandedGroups = new Set(expandedGroups);
        const planGroupId = typeof planGroup === 'string' ? planGroup : planGroup._id;
        if (!updatedExpandedGroups.delete(planGroupId)) {
            updatedExpandedGroups.add(planGroupId);
        }
        setExpandedGroups(updatedExpandedGroups);
    }, [expandedGroups]);

    const renderPlanRow = (plan: Immutable<BasicPlan>): ReactNode => {
        return (
            <PlansRoutePlanListRow
                key={plan._id}
                active={plan._id === selectedId}
                plan={plan}
                visibleColumns={visibleColumns}
                onClick={handleRowClick}
                onContextMenu={handleRowClick}
                onDoubleClick={handlePlanRowDoubleClick}
            />
        );
    };

    const renderPlanGroup = (planGroup: Immutable<PlanGroupAggregatedData>): ReactNode => {
        const planGroupId = planGroup._id;
        const expanded = expandedGroups.has(planGroupId);
        return (
            <PlansRoutePlanListGroupRow
                key={planGroupId}
                active={planGroupId === selectedId}
                expanded={expanded}
                planGroup={planGroup}
                visibleColumns={visibleColumns}
                onContextMenu={handlePlanListItemSelect}
                onExpandToggle={handlePlanGroupExpandToggle}
                onSelect={handlePlanListItemSelect}
            >
                {expanded && planGroup.plans.map(renderPlanRow)}
            </PlansRoutePlanListGroupRow>
        );
    };

    const defaultGroupExpanded = expandedGroups.has(PlanConstants.UngroupedGroupId);
    // TODO Wrap this in useMemo?
    const defaultPlanGroupNode: ReactNode = (
        <PlansRoutePlanListGroupRow
            key={PlanConstants.UngroupedGroupId}
            expanded={defaultGroupExpanded}
            planGroup={PlanConstants.UngroupedGroupId}
            visibleColumns={visibleColumns}
            onContextMenu={handlePlanListItemSelect}
            onExpandToggle={handlePlanGroupExpandToggle}
            onSelect={handlePlanListItemSelect}
        >
            {defaultGroupExpanded && planGrouping.ungrouped.map(renderPlanRow)}
        </PlansRoutePlanListGroupRow>
    );

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-list-container`}>
                <PlansRoutePlanListHeader visibleColumns={visibleColumns} />
                {defaultPlanGroupNode}
                {planGrouping.groups.map(renderPlanGroup)}
            </div>
        </Box>
    );

});

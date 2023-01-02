import { ImmutableBasicPlan, ImmutableBasicPlanGroup } from '@fgo-planner/data-core';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { MouseEvent, MouseEventHandler, ReactNode, useCallback } from 'react';
import { BasicPlans, PlanType, SortDirection } from '../../../../../types';
import { PlansRoutePlanListColumn as Column, PlansRoutePlanListColumnProperties as ColumnProperties, PlansRoutePlanListVisibleColumns as VisibleColumns } from './PlansRoutePlanListColumn.type';
import { PlansRoutePlanListHeader } from './PlansRoutePlanListHeader';
import { PlansRoutePlanListRow, StyleClassPrefix as RowStyleClassPrefix } from './PlansRoutePlanListRow';

type Props = {
    accountPlans: BasicPlans;
    onHeaderClick?: MouseEventHandler;
    onRowClick: MouseEventHandler;
    onRowDoubleClick: MouseEventHandler;
    onSelectionChange: (target: ImmutableBasicPlan | ImmutableBasicPlanGroup | undefined, type: PlanType) => void;
    onSortChange?: (column?: Column, direction?: SortDirection) => void;
    selectedId?: string;
    visibleColumns: Readonly<VisibleColumns>;
};

const StyleClassPrefix = 'PlansRoutePlanList';

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
                height: 52,
                px: 4,
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.875rem',
                '>div': {
                    boxSizing: 'border-box',
                    px: 2
                },
                [`& .${RowStyleClassPrefix}-name`]: {
                    width: ColumnProperties.name.width,
                    fontWeight: 500,
                    [breakpoints.down('sm')]: {
                        width: '100%',
                        px: 0
                    }
                },
                [`& .${RowStyleClassPrefix}-created`]: {
                    width: ColumnProperties.created.width,
                    textAlign: 'center'
                },
                [`& .${RowStyleClassPrefix}-modified`]: {
                    width: ColumnProperties.modified.width,
                    textAlign: 'center'
                },
                [`& .${RowStyleClassPrefix}-description`]: {
                    pl: 8
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
        accountPlans: {
            // TODO Also do something with planGroups
            plans
        },
        onRowClick,
        onRowDoubleClick,
        onSelectionChange,
        selectedId,
        visibleColumns
    } = props;

    const handlePlanRowClick = useCallback((e: MouseEvent, plan: ImmutableBasicPlan) => {
        onSelectionChange(plan, 'plan');
        onRowClick(e);
    }, [onRowClick, onSelectionChange]);
    
    const handlePlanGroupRowClick = useCallback((e: MouseEvent, plan: ImmutableBasicPlanGroup) => {
        onSelectionChange(plan, 'group');
        onRowClick(e);
    }, [onRowClick, onSelectionChange]);

    const renderPlanRow = (plan: ImmutableBasicPlan): ReactNode => {
        return (
            <PlansRoutePlanListRow
                key={plan._id}
                plan={plan}
                active={plan._id === selectedId}
                visibleColumns={visibleColumns}
                onClick={handlePlanRowClick}
                onContextMenu={handlePlanRowClick}
                onDoubleClick={onRowDoubleClick}
            />
        );
    };

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-list-container`}>
                <PlansRoutePlanListHeader visibleColumns={visibleColumns} />
                {/* TODO Render plan groups */}
                {plans.map(renderPlanRow)}
            </div>
        </Box>
    );

});

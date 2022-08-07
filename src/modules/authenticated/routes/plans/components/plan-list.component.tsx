import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { MouseEvent, MouseEventHandler, ReactNode, useCallback } from 'react';
import { MasterAccountPlans, PlanGroupLite, PlanLite, PlanType, SortDirection } from '../../../../../types/data';
import { PlanColumnProperties, PlanListColumn, PlanListVisibleColumns } from './plan-list-columns';
import { PlanListHeader } from './plan-list-header.component';
import { PlanListRow, StyleClassPrefix as PlanListRowStyleClassPrefix } from './plan-list-row.component';

type Props = {
    accountPlans: MasterAccountPlans;
    onHeaderClick?: MouseEventHandler;
    onRowClick: MouseEventHandler;
    onRowDoubleClick: MouseEventHandler;
    onSelectionChange: (target: PlanLite | PlanGroupLite | undefined, type: PlanType) => void;
    onSortChange?: (column?: PlanListColumn, direction?: SortDirection) => void;
    selectedId?: string;
    visibleColumns: Readonly<PlanListVisibleColumns>;
};

const StyleClassPrefix = 'PlanList';

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
            [`& .${PlanListRowStyleClassPrefix}-root`]: {
                height: 52,
                px: 4,
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.875rem',
                '>div': {
                    boxSizing: 'border-box',
                    px: 2
                },
                [`& .${PlanListRowStyleClassPrefix}-name`]: {
                    width: PlanColumnProperties.name.width,
                    fontWeight: 500,
                    [breakpoints.down('sm')]: {
                        width: '100%',
                        px: 0
                    }
                },
                [`& .${PlanListRowStyleClassPrefix}-created`]: {
                    width: PlanColumnProperties.created.width,
                    textAlign: 'center'
                },
                [`& .${PlanListRowStyleClassPrefix}-modified`]: {
                    width: PlanColumnProperties.modified.width,
                    textAlign: 'center'
                },
                [`& .${PlanListRowStyleClassPrefix}-description`]: {
                    pl: 8
                }
            },
            [breakpoints.down('sm')]: {
                minWidth: 0
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const PlanList = React.memo((props: Props) => {

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

    const handlePlanRowClick = useCallback((e: MouseEvent, plan: PlanLite) => {
        onSelectionChange(plan, 'plan');
        onRowClick(e);
    }, [onRowClick, onSelectionChange]);
    
    const handlePlanGroupRowClick = useCallback((e: MouseEvent, plan: PlanGroupLite) => {
        onSelectionChange(plan, 'group');
        onRowClick(e);
    }, [onRowClick, onSelectionChange]);

    const renderPlanRow = (plan: PlanLite): ReactNode => {
        return (
            <PlanListRow
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
                <PlanListHeader visibleColumns={visibleColumns} />
                {/* TODO Render plan groups */}
                {plans.map(renderPlanRow)}
            </div>
        </Box>
    );

});

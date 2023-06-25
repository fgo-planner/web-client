import { Immutable } from '@fgo-planner/common-core';
import { BasicPlan } from '@fgo-planner/data-core';
import { Link as MuiLink } from '@mui/material';
import React, { MouseEvent, ReactNode, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DataTableListRow } from '../../../../../components/data-table-list/DataTableListRow';
import { TruncateText } from '../../../../../components/text/TruncateText';
import { PlanConstants } from '../../../../../constants';
import { DateTimeFormatUtils } from '../../../../../utils/format/DateTimeFormatUtils';
import { PlansRoutePlanListColumn } from './PlansRoutePlanListColumn';

type Props = {
    active: boolean;
    plan: Immutable<BasicPlan>;
    visibleColumns: Readonly<PlansRoutePlanListColumn.Visibility>;
    onClick(event: MouseEvent, plan: Immutable<BasicPlan>): void;
    onContextMenu(event: MouseEvent, plan: Immutable<BasicPlan>): void;
    onDoubleClick(event: MouseEvent, plan: Immutable<BasicPlan>): void;
};

type RowText = {
    name: ReactNode;
    createdAt: string | undefined;
    updatedAt: string | undefined;
    description: string;
};

export const StyleClassPrefix = 'PlansRoutePlanListRow';

export const PlansRoutePlanListRow = React.memo((props: Props) => {

    const {
        active,
        plan,
        visibleColumns,
        onClick,
        onContextMenu,
        onDoubleClick
    } = props;

    const handleClick = useCallback((event: MouseEvent): void => {
        onClick(event, plan);
    }, [plan, onClick]);

    const handleContextMenu = useCallback((event: MouseEvent): void => {
        onContextMenu(event, plan);
    }, [plan, onContextMenu]);

    const handleDoubleClick = useCallback((event: MouseEvent): void => {
        onDoubleClick(event, plan);
    }, [plan, onDoubleClick]);

    const rowText = useMemo((): RowText => ({
        name: plan.name || <i>{PlanConstants.MissingNamePlaceholder}</i>,
        description: plan.description || '-',
        createdAt: DateTimeFormatUtils.formatForDataTable(plan.createdAt),
        updatedAt: DateTimeFormatUtils.formatForDataTable(plan.updatedAt)
    }), [plan]);

    return (
        <DataTableListRow
            className={`${StyleClassPrefix}-root`}
            borderBottom
            active={active}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onDoubleClick={handleDoubleClick}
        >
            <TruncateText className={`${StyleClassPrefix}-name`}>
                <MuiLink
                    className={`${StyleClassPrefix}-text`}
                    component={Link}
                    to={`${plan._id}`}
                    underline='none'
                >
                    {rowText.name}
                </MuiLink>
            </TruncateText>
            {visibleColumns.created &&
                <div className={`${StyleClassPrefix}-created`}>
                    <div className={`${StyleClassPrefix}-text`}>
                        {rowText.createdAt}
                    </div>
                </div>
            }
            {visibleColumns.modified &&
                <div className={`${StyleClassPrefix}-modified`}>
                    <div className={`${StyleClassPrefix}-text`}>
                        {rowText.updatedAt}
                    </div>
                </div>
            }
            {visibleColumns.description &&
                <TruncateText className={`${StyleClassPrefix}-description`}>
                    <div className={`${StyleClassPrefix}-text`}>
                        {rowText.description}
                    </div>
                </TruncateText>
            }
        </DataTableListRow>
    );

});

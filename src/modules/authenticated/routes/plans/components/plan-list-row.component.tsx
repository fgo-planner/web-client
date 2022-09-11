import { Immutable } from '@fgo-planner/common-core';
import { BasicPlan } from '@fgo-planner/data-core';
import { Link as MuiLink } from '@mui/material';
import React, { MouseEvent, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DataTableListStaticRow } from '../../../../../components/data-table-list/data-table-list-static-row.component';
import { TruncateText } from '../../../../../components/text/truncate-text.component';
import { PlanConstants } from '../../../../../constants';
import { DateTimeFormatUtils } from '../../../../../utils/date-time-format.utils';
import { PlanListVisibleColumns } from './plan-list-columns';

type Props = {
    active: boolean;
    onClick: (e: MouseEvent, plan: Immutable<BasicPlan>) => void;
    onContextMenu: (e: MouseEvent, plan: Immutable<BasicPlan>) => void;
    onDoubleClick: (e: MouseEvent, plan: Immutable<BasicPlan>) => void;
    plan: Immutable<BasicPlan>;
    visibleColumns: Readonly<PlanListVisibleColumns>;
};

export const StyleClassPrefix = 'PlanListRow';

export const PlanListRow = React.memo((props: Props) => {

    const {
        active,
        onClick,
        onContextMenu,
        onDoubleClick,
        plan, 
        visibleColumns
    } = props;

    const {
        created,
        modified,
        description
    } = visibleColumns;

    const handleClick = useCallback((e: MouseEvent): void => {
        onClick(e, plan);
    }, [onClick, plan]);

    const handleContextMenu = useCallback((e: MouseEvent): void => {
        onContextMenu(e, plan);
    }, [onContextMenu, plan]);

    const handleDoubleClick = useCallback((e: MouseEvent): void => {
        onDoubleClick(e, plan);
    }, [onDoubleClick, plan]);

    return (
        <DataTableListStaticRow
            className={`${StyleClassPrefix}-root`}
            borderBottom
            active={active}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onDoubleClick={handleDoubleClick}
        >
            <TruncateText className={`${StyleClassPrefix}-name`}>
                <MuiLink component={Link} to={`${plan._id}`} underline='none'>
                    {plan.name || <i>{PlanConstants.MissingNamePlaceholder}</i>}
                </MuiLink>
            </TruncateText>
            {created && <div className={`${StyleClassPrefix}-created`}>
                {DateTimeFormatUtils.formatForDataTable(plan.createdAt)}
            </div>}
            {modified && <div className={`${StyleClassPrefix}-modified`}>
                {DateTimeFormatUtils.formatForDataTable(plan.updatedAt)}
            </div>}
            {description && <TruncateText className={`${StyleClassPrefix}-description`}>
                {plan.description || '-'}
            </TruncateText>}
        </DataTableListStaticRow>
    );

});

import { Plan } from '@fgo-planner/types';
import { Link as MuiLink } from '@mui/material';
import React, { MouseEvent, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { StaticListRowContainer } from '../../../../../components/data-table-list/static-list-row-container.component';
import { TruncateText } from '../../../../../components/text/truncate-text.component';
import { PlanConstants } from '../../../../../constants';
import { Immutable } from '../../../../../types/internal';
import { DateTimeUtils } from '../../../../../utils/date-time.utils';
import { PlanListVisibleColumns } from './plan-list-columns';

type Props = {
    active: boolean;
    onClick: (e: MouseEvent, plan: Immutable<Partial<Plan>>) => void;
    onContextMenu: (e: MouseEvent, plan: Immutable<Partial<Plan>>) => void;
    onDoubleClick: (e: MouseEvent, plan: Immutable<Partial<Plan>>) => void;
    plan: Immutable<Partial<Plan>>;
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
        <StaticListRowContainer
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
                {DateTimeUtils.formatForDataTable(plan.createdAt)}
            </div>}
            {modified && <div className={`${StyleClassPrefix}-modified`}>
                {DateTimeUtils.formatForDataTable(plan.updatedAt)}
            </div>}
            {description && <TruncateText className={`${StyleClassPrefix}-description`}>
                {plan.description || '-'}
            </TruncateText>}
        </StaticListRowContainer>
    );

});

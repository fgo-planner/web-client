import { Plan } from '@fgo-planner/types';
import { Link as MuiLink } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { StaticListRowContainer } from '../../../../../components/data-table-list/static-list-row-container.component';
import { TruncateText } from '../../../../../components/text/truncate-text.component';
import { PlanConstants } from '../../../../../constants';
import { Immutable } from '../../../../../types/internal';
import { DateTimeUtils } from '../../../../../utils/date-time.utils';
import { PlanListVisibleColumns } from './plan-list-columns';

type Props = {
    plan: Immutable<Plan>;
    visibleColumns: Readonly<PlanListVisibleColumns>;
};

export const StyleClassPrefix = 'PlanListRow';

export const PlanListRow = React.memo(({ plan, visibleColumns }: Props) => {

    const {
        created,
        modified,
        description
    } = visibleColumns;

    return (
        <StaticListRowContainer
            className={`${StyleClassPrefix}-root`}
            borderBottom
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

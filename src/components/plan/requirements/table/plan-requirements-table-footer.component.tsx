import React from 'react';
import { PlanRequirements } from '../../../../types/data';
import { PlanRequirementsTableItemsRow } from './plan-requirements-table-items-row.component';
import { PlanRequirementsTableOptionsInternal } from './plan-requirements-table-options-internal.type';
import { PlanRequirementsTableTotalRow } from './plan-requirements-table-total-row.component';

type Props = {
    options: PlanRequirementsTableOptionsInternal;
    planRequirements: PlanRequirements;
};

export const StyleClassPrefix = 'PlanRequirementsTableFooter';

export const PlanRequirementsTableFooter = React.memo(({ options, planRequirements }: Props) => (
    <div className={`${StyleClassPrefix}-root`}>
        <PlanRequirementsTableTotalRow
            borderTop
            requirements={planRequirements.group}
            options={options}
        />
        <PlanRequirementsTableItemsRow
            borderTop
            options={options}
        />
    </div>
));

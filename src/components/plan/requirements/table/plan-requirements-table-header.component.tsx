import React from 'react';
import { PlanRequirementsTableItemsRow } from './plan-requirements-table-items-row.component';
import { PlanRequirementsTableOptionsInternal } from './plan-requirements-table-options-internal.type';

type Props = {
    options: PlanRequirementsTableOptionsInternal;
};

export const StyleClassPrefix = 'PlanRequirementsTableHeader';

export const PlanRequirementsTableHeader = React.memo(({ options }: Props) => (
    <div className={`${StyleClassPrefix}-root`}>
        <PlanRequirementsTableItemsRow options={options} borderBottom />
    </div>
));

import React, { ReactNode } from 'react';
import { PlanEnhancementRequirements } from '../../../../types/data';
import { PlanRequirementsTableCell } from './plan-requirements-table-cell.component';
import { PlanRequirementsTableOptionsInternal } from './plan-requirements-table-options-internal.type';
import { PlanRequirementsTableRow } from './plan-requirements-table-row.component';

type Props = {
    options: PlanRequirementsTableOptionsInternal;
    requirements: PlanEnhancementRequirements;
};

export const PlanRequirementsTableTotalRow = React.memo((props: Props) => {

    const {
        options,
        requirements
    } = props;

    //#region Input event handlers


    //#endregion


    //#region Component rendering

    const renderItemCell = (itemId: number): ReactNode => {
        const itemRequirements = requirements.items[itemId];
        return (
            <PlanRequirementsTableCell
                key={itemId}
                size={options.displaySize}
                bold
            >
                {itemRequirements?.total}
            </PlanRequirementsTableCell>
        );
    };

    return (
        <PlanRequirementsTableRow borderTop borderBottom>
            <div style={{ width: 320, lineHeight: `${options.displaySize}px`, textAlign: 'center', fontWeight: 500 }}>
                TOTAL
            </div>
            {options.displayedItems.map(renderItemCell)}
        </PlanRequirementsTableRow>
    );

    //#endregion

});

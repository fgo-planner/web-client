import React, { ReactNode } from 'react';
import { PlanEnhancementRequirements } from '../../../../types/data';
import { PlanRequirementsTableCell } from './plan-requirements-table-cell.component';
import { PlanRequirementsTableOptionsInternal } from './plan-requirements-table-options-internal.type';
import { PlanRequirementsTableRow } from './plan-requirements-table-row.component';

type Props = {
    borderBottom?: boolean;
    borderTop?: boolean;
    options: PlanRequirementsTableOptionsInternal;
    requirements: PlanEnhancementRequirements;
};

export const PlanRequirementsTableTotalRow = React.memo((props: Props) => {

    const {
        borderBottom,
        borderTop,
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
                size={options.cellSize}
                bold
            >
                {itemRequirements?.total}
            </PlanRequirementsTableCell>
        );
    };

    return (
        <PlanRequirementsTableRow
            borderTop={borderTop}
            borderBottom={borderBottom}
            options={options}
            stickyColumn={(
                <div style={{ width: 320, lineHeight: `${options.cellSize}px`, textAlign: 'center', fontWeight: 500 }}>
                    TOTAL
                </div>
            )}
            scrollContents={options.displayedItems.map(renderItemCell)}
        />
    );

    //#endregion

});

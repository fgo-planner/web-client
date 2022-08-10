import { Theme } from '@mui/material';
import { SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ReactNode } from 'react';
import { PlanRequirements } from '../../../../types/data';
import { DataTableGridCell } from '../../../data-table-grid/data-table-grid-cell.component';
import { DataTableGridRow } from '../../../data-table-grid/data-table-grid-row.component';
import { PlanRequirementsTableOptionsInternal } from './plan-requirements-table-options-internal.type';

type Props = {
    options: PlanRequirementsTableOptionsInternal;
    planRequirements: PlanRequirements;
};

const StyleClassPrefix = 'PlanRequirementsTableFooter';

const StyleProps = (theme: SystemTheme) => {
    
    const {
        palette,
        spacing
    } = theme as Theme;

    return {
        position: 'sticky',
        bottom: 0,
        zIndex: 3,
        [`& .${StyleClassPrefix}-sticky-content`]: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 320,
            height: '100%',
            fontWeight: 500,
            background: palette.background.paper
        },
        [`& .${StyleClassPrefix}-cell`]: {
            background: palette.background.paper
        }
    } as SystemStyleObject<SystemTheme>;
};

export const PlanRequirementsTableFooter = React.memo((props: Props) => {

    const {
        options,
        planRequirements
    } = props;

    //#region Component rendering

    const renderItemCell = (itemId: number): ReactNode => {
        const itemRequirements = planRequirements.group.items[itemId];
        return (
            <DataTableGridCell
                key={itemId}
                className={`${StyleClassPrefix}-cell`}
                size={options.cellSize}
                bold
            >
                {itemRequirements?.total}
            </DataTableGridCell>
        );
    };

    const stickyContent: ReactNode = (
        <div className={`${StyleClassPrefix}-sticky-content`}>
            TOTAL
        </div>
    );

    return (
        <DataTableGridRow
            className={`${StyleClassPrefix}-root`}
            sx={StyleProps}
            borderTop
            borderBottom
            stickyContent={stickyContent}
        >
            {options.displayedItems.map(renderItemCell)}
        </DataTableGridRow>
    );

    //#endregion

});

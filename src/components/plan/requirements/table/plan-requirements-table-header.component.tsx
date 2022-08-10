import { Theme } from '@mui/material';
import { SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ReactNode } from 'react';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { DataTableGridCell } from '../../../data-table-grid/data-table-grid-cell.component';
import { DataTableGridRow } from '../../../data-table-grid/data-table-grid-row.component';
import { GameItemThumbnail } from '../../../game/item/game-item-thumbnail.component';
import { PlanRequirementsTableOptionsInternal } from './plan-requirements-table-options-internal.type';

type Props = {
    options: PlanRequirementsTableOptionsInternal;
};

export const StyleClassPrefix = 'PlanRequirementsTableHeader';

const StyleProps = (theme: SystemTheme) => {

    const {
        palette,
        spacing
    } = theme as Theme;

    return {
        position: 'sticky',
        top: 0,
        zIndex: 3,
        [`& .${StyleClassPrefix}-sticky-content`]: {
            width: 320,
            height: '100%',
            background: palette.background.paper
        },
        [`& .${StyleClassPrefix}-cell`]: {
            background: palette.background.paper
        }
    } as SystemStyleObject<SystemTheme>;
};

export const PlanRequirementsTableHeader = React.memo(({ options }: Props) => {

    const gameItemMap = useGameItemMap();

    if (!gameItemMap) {
        return null;
    }

    const stickyContent: ReactNode = (
        <div className={`${StyleClassPrefix}-sticky-content`} />
    );

    const renderItemCell = (itemId: number): ReactNode => {
        const gameItem = gameItemMap[itemId];
        return (
            <DataTableGridCell
                key={itemId}
                className={`${StyleClassPrefix}-cell`}
                size={options.cellSize}
            >
                <GameItemThumbnail
                    gameItem={gameItem}
                    size={options.cellSize}
                    showBackground
                />
            </DataTableGridCell>
        );
    };

    return (
        <DataTableGridRow
            className={`${StyleClassPrefix}-root`}
            sx={StyleProps}
            borderBottom
            stickyContent={stickyContent}
        >
            {options.displayedItems.map(renderItemCell)}
        </DataTableGridRow>
    );

});

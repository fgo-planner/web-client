import { Immutable } from '@fgo-planner/common-core';
import { GameItem } from '@fgo-planner/data-core';
import clsx from 'clsx';
import React, { MouseEvent, useCallback } from 'react';
import { DataTableGridCell } from '../../../data-table-grid/DataTableGridCell';
import { ItemThumbnail } from '../../../item/ItemThumbnail';

type Props = {
    active?: boolean;
    gameItem: Immutable<GameItem>;
    hover?: boolean;
    onHover?: (index?: number, itemId?: number) => void;
};

export const StyleClassPrefix = 'PlanRequirementsTableHeaderCell';

export const PlanRequirementsTableHeaderCell = React.memo((props: Props) => {

    const {
        active,
        gameItem,
        hover,
        onHover
    } = props;

    const handleMouseEnter = useCallback((_event: MouseEvent): void => {
        onHover?.(undefined, gameItem._id);
    }, [gameItem._id, onHover]);

    const className = clsx(
        `${StyleClassPrefix}-root`,
        active && `${StyleClassPrefix}-active`,
        hover && `${StyleClassPrefix}-hover`
    );

    return (
        <DataTableGridCell
            className={className}
            onMouseEnter={handleMouseEnter}
        >
            <ItemThumbnail
                gameItem={gameItem}
                size='3.25em'  // TODO Un-hardcode this
                showBackground
            />
        </DataTableGridCell>
    );

});

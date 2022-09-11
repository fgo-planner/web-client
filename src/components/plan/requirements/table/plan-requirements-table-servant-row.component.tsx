import { Immutable } from '@fgo-planner/common-core';
import { GameServant, ImmutableMasterServant, PlanServant } from '@fgo-planner/data-core';
import { DeleteForeverOutlined as DeleteForeverOutlinedIcon, Edit as EditIcon } from '@mui/icons-material';
import { Box, IconButton, Theme } from '@mui/material';
import { useTheme } from '@mui/system';
import React, { ReactNode, useCallback } from 'react';
import { PlanServantRequirements } from '../../../../types/data';
import { DataTableGridCell } from '../../../data-table-grid/data-table-grid-cell.component';
import { DataTableGridRow } from '../../../data-table-grid/data-table-grid-row.component';
import { GameServantThumbnail } from '../../../game/servant/game-servant-thumbnail.component';
import { TruncateText } from '../../../text/truncate-text.component';
import { PlanRequirementsTableOptionsInternal } from './plan-requirements-table-options-internal.type';

type Props = {
    borderBottom?: boolean;
    borderTop?: boolean;
    gameServant: Immutable<GameServant>;
    masterServant: ImmutableMasterServant;
    /**
     * @deprecated Remove edit button from servant row
     */
    onEditServant?: (planServant: Immutable<PlanServant>) => void;
    /**
     * @deprecated Remove delete button from servant row
     */
    onDeleteServant?: (planServant: Immutable<PlanServant>) => void;
    options: PlanRequirementsTableOptionsInternal;
    planServant: Immutable<PlanServant>;
    servantRequirements: PlanServantRequirements;
};

export const PlanRequirementsTableServantRow = React.memo((props: Props) => {

    const {
        borderBottom,
        borderTop,
        gameServant,
        masterServant,
        onDeleteServant,
        onEditServant,
        options,
        planServant,
        servantRequirements
    } = props;

    const {
        palette
    } = useTheme() as Theme;


    //#region Input event handlers

    const handleEditClick = useCallback(() => {
        onEditServant?.(planServant);
    }, [onEditServant, planServant]);

    const handleDeleteClick = useCallback(() => {
        onDeleteServant?.(planServant);
    }, [onDeleteServant, planServant]);

    //#endregion


    //#region Component rendering
    
    const stickyContent: ReactNode = (
        <Box
            style={{
                width: 320,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: palette.background.paper
            }}
        >
            <GameServantThumbnail
                gameServant={gameServant}
                size={options.cellSize}
            />
            <TruncateText className='flex-fill px-2'>
                {gameServant.name}
            </TruncateText>
            <div>
                <IconButton onClick={handleEditClick}>
                    <EditIcon />
                </IconButton>
                <IconButton color='error' onClick={handleDeleteClick}>
                    <DeleteForeverOutlinedIcon />
                </IconButton>
            </div>
        </Box>
    );

    const renderItemCell = (itemId: number): ReactNode => {
        const itemRequirements = servantRequirements.requirements.items[itemId];
        return (
            <DataTableGridCell
                key={itemId}
                size={options.cellSize}
                backgroundColor={palette.background.paper}
            >
                {itemRequirements?.total}
            </DataTableGridCell>
        );
    };

    return (
        <DataTableGridRow
            borderTop={borderTop}
            borderBottom={borderBottom}
            stickyContent={stickyContent}
        >
            {options.displayedItems.map(renderItemCell)}
        </DataTableGridRow>
    );

    //#endregion

});

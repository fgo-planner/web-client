import { GameServant, MasterServant, PlanServant } from '@fgo-planner/types';
import { Edit as EditIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import React, { ReactNode, useCallback } from 'react';
import { PlanServantRequirements } from '../../../../types/data';
import { Immutable } from '../../../../types/internal';
import { GameServantThumbnail } from '../../../game/servant/game-servant-thumbnail.component';
import { PlanRequirementsTableCell } from './plan-requirements-table-cell.component';
import { PlanRequirementsTableOptionsInternal } from './plan-requirements-table-options-internal.type';
import { PlanRequirementsTableRow } from './plan-requirements-table-row.component';

type Props = {
    borderTop?: boolean;
    gameServant: Immutable<GameServant>;
    masterServant: Immutable<MasterServant>;
    onEditServant?: (planServant: Immutable<PlanServant>) => void;
    options: PlanRequirementsTableOptionsInternal;
    planServant: Immutable<PlanServant>;
    servantRequirements: PlanServantRequirements;
};

export const PlanRequirementsTableServantRow = React.memo((props: Props) => {

    const {
        borderTop,
        gameServant,
        masterServant,
        onEditServant,
        options,
        planServant,
        servantRequirements
    } = props;

    //#region Input event handlers

    const handleEditClick = useCallback(() => {
        onEditServant?.(planServant);
    }, [onEditServant, planServant]);

    //#endregion


    //#region Component rendering

    const renderItemCell = (itemId: number): ReactNode => {
        const itemRequirements = servantRequirements.requirements.items[itemId];
        return (
            <PlanRequirementsTableCell
                key={itemId}
                size={options.displaySize}
            >
                {itemRequirements?.total}
            </PlanRequirementsTableCell>
        );
    };

    return (
        <PlanRequirementsTableRow borderTop={borderTop}>
            <div style={{ width: 320, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <GameServantThumbnail
                    gameServant={gameServant}
                    size={options.displaySize}
                />
                <div className="flex-fill px-2">
                    {gameServant.name}
                </div>
                <div>
                    <IconButton onClick={handleEditClick}>
                        <EditIcon />
                    </IconButton>
                </div>
            </div>
            {options.displayedItems.map(renderItemCell)}
        </PlanRequirementsTableRow>
    );

    //#endregion

});

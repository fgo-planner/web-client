import { Immutable } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import React from 'react';
import { GameServantThumbnail } from '../../../game/servant/game-servant-thumbnail.component';
import { TruncateText } from '../../../text/truncate-text.component';
import { PlanRequirementsTableOptionsInternal } from './PlanRequirementsTableOptionsInternal.type';

type Props = {
    gameServant: Immutable<GameServant>;
    options: PlanRequirementsTableOptionsInternal;
};

export const StyleClassPrefix = 'PlanRequirementsTableServantRowHeader';

/**
 * Wrapping this component in React.memo is unnecessary because it is very basic
 * and a re-render of the parent component (`PlanRequirementsTableServantRow`)
 * will always trigger a re-render of this component anyways.
 */
/** */
export const PlanRequirementsTableServantRowHeader: React.FC<Props> = (props: Props): JSX.Element => {
    
    const {
        gameServant,
        options
    } = props;

    return (
        <div className={`${StyleClassPrefix}-root`}>
            <GameServantThumbnail
                gameServant={gameServant}
                size={options.cellSize}
            />
            <div className={`${StyleClassPrefix}-hover-overlay`} />
            <TruncateText className={`${StyleClassPrefix}-name`}>
                {gameServant.name}
            </TruncateText>
        </div>
    );

};

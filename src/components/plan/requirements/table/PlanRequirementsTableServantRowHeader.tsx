import { Immutable } from '@fgo-planner/common-core';
import React, { ReactNode } from 'react';
import { PlanServantAggregatedData } from '../../../../types';
import { GameServantThumbnail } from '../../../game/servant/game-servant-thumbnail.component';
import { TruncateText } from '../../../text/truncate-text.component';

type Props = {
    planServantData: Immutable<PlanServantAggregatedData>;
    servantRowHeaderMode: 'name' | 'enhancements' | 'toggle';
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
        planServantData: {
            gameServant,
            masterServant,
            planServant
        },
        servantRowHeaderMode
    } = props;

    let contentNode: ReactNode;
    if (servantRowHeaderMode === 'name') {
        contentNode = (
            <TruncateText className={`${StyleClassPrefix}-name`}>
                {gameServant.name}
            </TruncateText>
        );
    } else if (servantRowHeaderMode === 'enhancements') {
        contentNode = (
            <div className={`${StyleClassPrefix}-enhancements`}>
                enhancements
            </div>
        );
    } else {
        contentNode = (
            <div className={`${StyleClassPrefix}-toggle`}>
                toggle
            </div>
        );
    }

    return (
        <div className={`${StyleClassPrefix}-root`}>
            <GameServantThumbnail
                gameServant={gameServant}
                size='3.25em'  // TODO Un-hardcode this
            />
            <div className={`${StyleClassPrefix}-hover-overlay`} />
            {contentNode} 
        </div>
    );

};

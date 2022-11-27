import { Immutable } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import React from 'react';
import { ServantClassIcon } from '../../../../../../components/servant/ServantClassIcon';

type Props = {
    gameServant: Immutable<GameServant>;
};

export const StyleClassPrefix = 'MasterServantListRowLabel';

/**
 * Displays static info for a servant, such as class, rarity, and name.
 */
export const MasterServantListRowLabel = React.memo(({ gameServant }: Props) => (
    <div className={`${StyleClassPrefix}-root`}>
        <ServantClassIcon
            className={`${StyleClassPrefix}-class-icon`}
            servantClass={gameServant.class}
            rarity={gameServant.rarity}
        />
        <div className={`${StyleClassPrefix}-rarity`}>
            {`${gameServant.rarity} \u2605`}
        </div>
        <div className='truncate'>
            {gameServant.name}
        </div>
    </div>
));

import { MasterServantBondLevel } from '@fgo-planner/data-types';
import React from 'react';
import { GameServantBondIcon } from '../../../../../../components/game/servant/game-servant-bond-icon.component';
import { Nullable } from '../../../../../../types/internal';

type Props = {
    bondLevel: Nullable<MasterServantBondLevel>;
};

export const StyleClassPrefix = 'MasterServantListRowBondLevel';

export const MasterServantListRowBondLevel = React.memo(({ bondLevel }: Props) => {

    if (bondLevel == null) {
        return (
            <div className={`${StyleClassPrefix}-root`}>
                {'\u2014'}
            </div>
        );
    }

    return (
        <div className={`${StyleClassPrefix}-root`}>
            <GameServantBondIcon bond={bondLevel} size={28} />
            <div className='value'>
                {bondLevel}
            </div>
        </div>
    );

});

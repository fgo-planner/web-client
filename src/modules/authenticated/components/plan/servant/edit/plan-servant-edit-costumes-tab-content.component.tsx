import { GameServant } from '@fgo-planner/types';
import React from 'react';
import { Immutable } from '../../../../../../types/internal';

type Props = {
    gameServant: Immutable<GameServant>;
    onChange?: (values: Array<number>) => void;
    unlockedCostumes: Array<number>;
};

export const PlanServantEditCostumesTabContent = React.memo((props: Props) => {

    return (
        <i>Feature not yet available</i>
    );

});

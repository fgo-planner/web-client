import { Immutable } from '@fgo-planner/common-types';
import { GameServant } from '@fgo-planner/data-types';
import React from 'react';

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

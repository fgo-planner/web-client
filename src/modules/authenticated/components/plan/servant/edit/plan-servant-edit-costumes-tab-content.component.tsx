import { Immutable } from '@fgo-planner/common-core';
import { GameServant } from '@fgo-planner/data-core';
import React from 'react';

type Props = {
    gameServant: Immutable<GameServant>;
    onChange?: (values: Array<number>) => void;
    targetCostumes: ReadonlyArray<number>;
};

export const PlanServantEditCostumesTabContent = React.memo((props: Props) => {

    return (
        <i>Feature not yet available</i>
    );

});

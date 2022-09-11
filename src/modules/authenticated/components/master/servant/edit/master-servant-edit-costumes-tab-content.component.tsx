import { Immutable } from '@fgo-planner/common-core';
import { GameServant, MasterServantUpdate } from '@fgo-planner/data-core';
import React from 'react';

type Props = {
    /**
     * The game servant data that corresponds to the servant being edited. This
     * should be set to `undefined` if and only if multiple servants are being
     * edited.
     */
    gameServant?: Immutable<GameServant>;
    /**
     * The update payload for editing. This will be modified directly, so provide a
     * clone if modification to the original object is not desired.
     */
    masterServantUpdate: MasterServantUpdate;
    onChange?: (update: MasterServantUpdate) => void;
};

export const MasterServantEditCostumesTabContent = React.memo((props: Props) => {

    const {
        gameServant,
        masterServantUpdate,
        onChange
    } = props;

    if (!gameServant) {
        return null;
    }

    return (
        <i>Feature not yet available</i>
    );

});

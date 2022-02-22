import { GameServant } from '@fgo-planner/types';
import React from 'react';
import { Immutable } from '../../../../../../types/internal';
import { MasterServantEditData } from './master-servant-edit-data.type';

type Props = {
    /**
     * The servant data to edit. This will be modified directly, so provide a clone
     * if modification to the original object is not desired.
     */
    editData: MasterServantEditData;
    /**
     * The game servant data that corresponds to the servant being edited. This
     * should be set to `undefined` if and only if multiple servants are being
     * edited.
     */
    gameServant?: Immutable<GameServant>;
    onChange?: (data: MasterServantEditData) => void;
};

export const MasterServantEditCostumesTabContent = React.memo((props: Props) => {

    const {
        editData,
        gameServant,
        onChange
    } = props;

    if (!gameServant) {
        return null;
    }

    return (
        <i>Feature not yet available</i>
    );

});

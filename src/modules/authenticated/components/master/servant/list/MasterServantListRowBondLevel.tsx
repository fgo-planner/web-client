import { Nullable } from '@fgo-planner/common-core';
import { InstantiatedServantBondLevel } from '@fgo-planner/data-core';
import React from 'react';
import { ServantBondIcon } from '../../../../../../components/servant/ServantBondIcon';

type Props = {
    bondLevel: Nullable<InstantiatedServantBondLevel>;
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
            <ServantBondIcon bond={bondLevel} size={28} />
            <div className='value'>
                {bondLevel}
            </div>
        </div>
    );

});

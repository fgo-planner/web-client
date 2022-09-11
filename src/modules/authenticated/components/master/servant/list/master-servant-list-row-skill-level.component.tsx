import { MasterServant } from '@fgo-planner/data-core';
import React from 'react';

type Props = MasterServant['skills'] | MasterServant['appendSkills'];

export const StyleClassPrefix = 'MasterServantListRowSkillLevel';

export const MasterServantListRowSkillLevel = React.memo((props: Props) => {

    const {
        1: skill1,
        2: skill2,
        3: skill3
    } = props;

    return (
        <div className={`${StyleClassPrefix}-root`}>
            <div className='value'>
                {skill1 ?? '\u2013'}
            </div>
            /
            <div className='value'>
                {skill2 ?? '\u2013'}
            </div>
            /
            <div className='value'>
                {skill3 ?? '\u2013'}
            </div>
        </div>
    );
    
});

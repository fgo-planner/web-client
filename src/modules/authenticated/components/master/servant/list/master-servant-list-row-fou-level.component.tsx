import React from 'react';

type Props = {
    fouLevel?: number; 
};

export const StyleClassPrefix = 'MasterServantListRowFouLevel';

export const MasterServantListRowFouLevel = React.memo(({ fouLevel }: Props) => {
    return (
        <div className={`${StyleClassPrefix}-root`}>
            {fouLevel === undefined ? '\u2014' : `+${fouLevel}`}
        </div>
    );
});

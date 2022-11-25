import { InstantiatedServantBondLevel } from '@fgo-planner/data-core';
import React, { CSSProperties, useMemo } from 'react';
import { AssetConstants } from '../../../constants';

type Props = {
    bond: InstantiatedServantBondLevel;
    size?: string | number;
};

const DefaultSize = 50;

// TODO Define StyleClassPrefix? 

export const GameServantBondIcon = React.memo(({ bond, size }: Props) => {

    const imageUrl = AssetConstants.ServantBondIconMap[bond];

    const sizeStyle = useMemo((): CSSProperties => ({
        width: size || DefaultSize,
        height: size || DefaultSize
    }), [size]);

    return (
        <div style={sizeStyle}>
            <img
                className='full-width full-height'
                src={imageUrl}
                alt={`Bond ${bond}`}
            />
        </div>
    );

});

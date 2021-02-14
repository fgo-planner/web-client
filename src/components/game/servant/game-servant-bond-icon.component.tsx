import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React from 'react';
import { AssetConstants } from '../../../constants';
import { MasterServantBondLevel } from '../../../types';

type Props = {
    bond: MasterServantBondLevel;
    size?: string | number;
};

const DefaultSize = 50;

const style = () => ({
    img: {
        width: '100%',
        height: '100%'
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'GameServantBondIcon'
};

const useStyles = makeStyles(style, styleOptions);

export const GameServantBondIcon = React.memo(({ bond, size }: Props) => {
    const classes = useStyles();
    const imageUrl = AssetConstants.ServantBondIconMap[bond];
    size = size || DefaultSize;
    return (
        <div style={{width: size, height: size}}>
            <img className={classes.img} src={imageUrl} alt={`Bond ${bond}`} />
        </div>
    );
});

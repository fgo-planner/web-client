import { Box, makeStyles, StyleRules } from '@material-ui/core';
import { AssetConstants } from 'app-constants';
import { MasterServantBondLevel } from 'data';
import React from 'react';

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

const useStyles = makeStyles(style);

export const GameServantBondIcon = React.memo(({ bond, size }: Props) => {
    const classes = useStyles();
    const imageUrl = AssetConstants.ServantBondIconMap[bond];
    size = size || DefaultSize;
    return (
        <Box width={size} height={size}>
            <img className={classes.img} src={imageUrl} alt={`Bond ${bond}`} />
        </Box>
    );
});

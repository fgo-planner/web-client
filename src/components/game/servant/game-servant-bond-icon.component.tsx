import { Box, makeStyles, StyleRules } from '@material-ui/core';
import { GameServantConstants } from 'app-constants';
import React from 'react';

type Props = {
    bond: number;
    size?: string | number;
};

const BondIconBaseUrl = GameServantConstants.BondIconBaseUrl;

const BondIconExtension = GameServantConstants.BondIconExtension;

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
    size = size || DefaultSize;
    const bondString = bond > 10 ? 'grailed' : String(bond);
    const imageUrl = `${BondIconBaseUrl}/bond_${bondString}.${BondIconExtension}`;
    return (
        <Box width={size} height={size}>
            <img className={classes.img} src={imageUrl} alt={`Bond ${bond}`} />
        </Box>
    );
});
import { Box, makeStyles, StyleRules } from '@material-ui/core';
import { AssetConstants } from 'app-constants';
import { GameServantClass, GameServantRarity } from 'data';
import React from 'react';

type Props = {
    servantClass: GameServantClass;
    rarity: GameServantRarity;
    size?: string | number;
};

const ClassIconBaseUrl = AssetConstants.ServantClassIconBaseUrl;

const ClassNumberMap: { readonly [key in GameServantClass]: number } = {
    [GameServantClass.Saber]: 1,
    [GameServantClass.Archer]: 2,
    [GameServantClass.Lancer]: 3,
    [GameServantClass.Rider]: 4,
    [GameServantClass.Caster]: 5,
    [GameServantClass.Assassin]: 6,
    [GameServantClass.Berserker]: 7,
    [GameServantClass.Shielder]: 8,
    [GameServantClass.Ruler]: 9,
    [GameServantClass.AlterEgo]: 10,
    [GameServantClass.Avenger]: 11,
    [GameServantClass.MoonCancer]: 23,
    [GameServantClass.Foreigner]: 25,
    [GameServantClass.BeastI]: 22,
    [GameServantClass.BeastII]: 20,
    [GameServantClass.BeastIIIR]: 24,
    [GameServantClass.BeastIIIL]: 26,
    [GameServantClass.BeastFalse]: 27,
    [GameServantClass.Unknown]: 12
};

const RarityColorMap: { readonly [key in GameServantRarity]: number } = {
    0: 0,
    1: 1,
    2: 1,
    3: 2,
    4: 3,
    5: 3
};

const DefaultClassNumber = 12;

const DefaultRarityColor = 1;

const DefaultSize = 28;

const style = () => ({
    img: {
        width: '100%',
        height: '100%'
    }
} as StyleRules);

const useStyles = makeStyles(style);

export const GameServantClassIcon = React.memo(({ servantClass, rarity, size }: Props) => {
    const classes = useStyles();
    size = size || DefaultSize;
    const classNumber = ClassNumberMap[servantClass] || DefaultClassNumber;
    const rarityColor = RarityColorMap[rarity] ?? DefaultRarityColor;
    const imageUrl = `${ClassIconBaseUrl}/class${rarityColor}_${classNumber}.png`;
    return (
        <Box width={size} height={size}>
            <img className={classes.img} src={imageUrl} alt={servantClass} />
        </Box>
    );
});

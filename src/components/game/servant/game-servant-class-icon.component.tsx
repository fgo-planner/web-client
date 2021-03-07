import { makeStyles, StyleRules, Tooltip, TooltipProps } from '@material-ui/core';
import React from 'react';
import { AssetConstants } from '../../../constants';
import { GameServantClass, GameServantClassDisplayMap, GameServantRarity, ReadonlyRecord } from '../../../types';

type ClassIconName = GameServantClass | 'Extra' | 'All';

type Props = {
    servantClass: ClassIconName;
    rarity: GameServantRarity;
    size?: string | number;
    tooltip?: boolean;
    tooltipPlacement?: TooltipProps['placement'];
};

const ClassIconBaseUrl = AssetConstants.ServantClassIconBaseUrl;

const ClassNameMap: ReadonlyRecord<ClassIconName, string> = {
    ...GameServantClassDisplayMap,
    'Extra': 'Extra',
    'All': 'All'
};

const ClassNumberMap: ReadonlyRecord<ClassIconName, number> = {
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
    [GameServantClass.Unknown]: 12,
    'Extra': 1002,
    'All': 0 // TODO Find the code for this
};

const RarityColorMap: ReadonlyRecord<GameServantRarity, number> = {
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

export const GameServantClassIcon = React.memo((props: Props) => {

    const {
        servantClass,
        rarity,
        tooltip,
        tooltipPlacement
    } = props;

    const classes = useStyles();

    const size = props.size || DefaultSize;
    const classNumber = ClassNumberMap[servantClass] || DefaultClassNumber;
    const rarityColor = RarityColorMap[rarity] ?? DefaultRarityColor;
    const imageUrl = `${ClassIconBaseUrl}/class${rarityColor}_${classNumber}.png`;

    const icon = (
        <div style={{ width: size, height: size }}>
            <img className={classes.img} src={imageUrl} alt={servantClass} />
        </div>
    );

    if (tooltip) {
        return (
            <Tooltip title={ClassNameMap[servantClass] ?? ''} placement={tooltipPlacement}>
                {icon}
            </Tooltip>
        );
    }
    return icon;
});

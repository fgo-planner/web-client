import { GameServantClass, GameServantRarity } from '@fgo-planner/types';
import { makeStyles, StyleRules, Tooltip, TooltipProps } from '@material-ui/core';
import React, { CSSProperties, useMemo } from 'react';
import { AssetConstants } from '../../../constants';
import { ReadonlyRecord } from '../../../types/internal';

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
    [GameServantClass.Saber]: GameServantClass.Saber,
    [GameServantClass.Archer]: GameServantClass.Archer,
    [GameServantClass.Lancer]: GameServantClass.Lancer,
    [GameServantClass.Rider]: GameServantClass.Rider,
    [GameServantClass.Caster]: GameServantClass.Caster,
    [GameServantClass.Assassin]: GameServantClass.Assassin,
    [GameServantClass.Berserker]: GameServantClass.Berserker,
    [GameServantClass.Shielder]: GameServantClass.Shielder,
    [GameServantClass.Ruler]: GameServantClass.Ruler,
    [GameServantClass.AlterEgo]: 'Alter Ego',
    [GameServantClass.Avenger]: GameServantClass.Avenger,
    [GameServantClass.MoonCancer]: 'Moon Cancer',
    [GameServantClass.Foreigner]: GameServantClass.Foreigner,
    [GameServantClass.BeastI]: 'Beast I',
    [GameServantClass.BeastII]: 'Beast II',
    [GameServantClass.BeastIIIR]: 'Beast III/R',
    [GameServantClass.BeastIIIL]: 'Beast III/L',
    [GameServantClass.BeastFalse]: 'Beast (False)',
    [GameServantClass.Pretender]: GameServantClass.Pretender,
    [GameServantClass.Unknown]: GameServantClass.Unknown,
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
    [GameServantClass.Pretender]: 28,
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

const DefaultSize = 24;

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
    const elemStyle = useMemo((): CSSProperties => ({
        minWidth: size,
        maxWidth: size,
        height: size
    }), [size]);

    const classNumber = ClassNumberMap[servantClass] || DefaultClassNumber;
    const rarityColor = RarityColorMap[rarity] ?? DefaultRarityColor;
    const imageUrl = `${ClassIconBaseUrl}/class${rarityColor}_${classNumber}.png`;

    const icon = (
        <div style={elemStyle}>
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

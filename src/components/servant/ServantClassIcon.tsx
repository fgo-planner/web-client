import { ReadonlyRecord } from '@fgo-planner/common-core';
import { GameServantClass, GameServantConstants, GameServantRarity } from '@fgo-planner/data-core';
import { Tooltip, TooltipProps } from '@mui/material';
import { Box } from '@mui/system';
import React, { CSSProperties, useMemo } from 'react';
import { AssetConstants } from '../../constants';
import { ComponentStyleProps, GameServantClassSimplified } from '../../types';

type ClassIconName = GameServantClass | typeof GameServantClassSimplified.Extra;

type Props = {
    servantClass: ClassIconName;
    rarity: GameServantRarity;
    size?: string | number;
    tooltip?: boolean;
    tooltipPlacement?: TooltipProps['placement'];
} & Pick<ComponentStyleProps, 'className' | 'sx'>;

const ClassIconBaseUrl = AssetConstants.ServantClassIconBaseUrl;

// TODO Maybe move this to GameServantConstants
const ExtraClassNumber = 1002;

const ClassNameMap: ReadonlyRecord<ClassIconName, string> = {
    ...GameServantConstants.ClassDisplayNameMap,
    [GameServantClassSimplified.Extra]: GameServantClassSimplified.Extra
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

const styles = {
    img: {
        width: '100%',
        height: '100%'
    } as CSSProperties
} as const;

export const ServantClassIcon = React.memo((props: Props) => {

    const {
        className,
        rarity,
        servantClass,
        size,
        sx,
        tooltip,
        tooltipPlacement
    } = props;

    const sizeStyle = useMemo((): CSSProperties => ({
        minWidth: size || DefaultSize,
        maxWidth: size || DefaultSize,
        height: size || DefaultSize
    }), [size]);

    const classNumber = useMemo((): number => {
        if (servantClass === GameServantClassSimplified.Extra) {
            return ExtraClassNumber;
        }
        return GameServantConstants.ClassNumberMap[servantClass as GameServantClass] || DefaultClassNumber;
    }, [servantClass]);

    const rarityColor = RarityColorMap[rarity] ?? DefaultRarityColor;
    const imageUrl = `${ClassIconBaseUrl}/class${rarityColor}_${classNumber}.png`;

    const iconNode = useMemo((): JSX.Element => {
        if (sx) {
            return (
                <Box className={className} style={sizeStyle} sx={sx}>
                    <img style={styles.img} src={imageUrl} alt={servantClass} />
                </Box>
            );
        }
        return (
            <div className={className} style={sizeStyle}>
                <img style={styles.img} src={imageUrl} alt={servantClass} />
            </div>
        );
    }, [sx, className, sizeStyle, imageUrl, servantClass]);

    if (tooltip) {
        return (
            <Tooltip title={ClassNameMap[servantClass] || servantClass} placement={tooltipPlacement}>
                {iconNode}
            </Tooltip>
        );
    }

    return iconNode;
});

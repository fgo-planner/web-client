import { MasterServantAscensionLevel } from '@fgo-planner/types';
import { AddBox as AddBoxIcon, AddBoxOutlined as AddBoxOutlinedIcon, LooksOneOutlined as LooksOneOutlinedIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React from 'react';
import { GameServantConstants } from '../../../constants';
import { ComponentStyleProps } from '../../../types/internal';

type Props = {
    disabled?: boolean;
    ignoreTabNavigation?: boolean;
    maxLevel?: number;
    /**
     * The servant's natural max level.
     */
    naturalMaxLevel: number;
    onClick?: (level: number, ascension: MasterServantAscensionLevel) => void;
} & Pick<ComponentStyleProps, 'className'>;

const TooltipEnterDelay = 250;

const DefaultMaxLevel = GameServantConstants.MaxLevel;

export const StyleClassPrefix = 'ServantLevelQuickToggleButtons';

const StyleProps = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    width: 40
} as SystemStyleObject<Theme>;

/**
 * Button for quickly toggling a servant's level between min and max.
 */
export const ServantLevelQuickToggleButtons = React.memo((props: Props) => {

    const {
        disabled,
        ignoreTabNavigation,
        naturalMaxLevel,
        onClick,
        className
    } = props;

    const maxLevel = props.maxLevel || DefaultMaxLevel;

    const tabIndex = ignoreTabNavigation ? -1 : 0;

    return (
        <Box className={clsx(`${StyleClassPrefix}-root`, className)} sx={StyleProps}>
            <Tooltip title='Set to level 1' enterDelay={TooltipEnterDelay}>
                <IconButton
                    color='primary'
                    onClick={() => onClick?.(GameServantConstants.MinLevel, GameServantConstants.MinAscensionLevel)}
                    tabIndex={tabIndex}
                    disabled={disabled}
                >
                    <LooksOneOutlinedIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title='Set to natural cap' enterDelay={TooltipEnterDelay}>
                <IconButton
                    color='primary'
                    onClick={() => onClick?.(naturalMaxLevel, GameServantConstants.MaxAscensionLevel)}
                    tabIndex={tabIndex}
                    disabled={disabled}
                >
                    <AddBoxOutlinedIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title={`Set to level ${maxLevel}`} enterDelay={TooltipEnterDelay}>
                <IconButton
                    color='primary'
                    onClick={() => onClick?.(maxLevel, GameServantConstants.MaxAscensionLevel)}
                    tabIndex={tabIndex}
                    disabled={disabled}
                >
                    <AddBoxIcon />
                </IconButton>
            </Tooltip>
        </Box>
    );

});

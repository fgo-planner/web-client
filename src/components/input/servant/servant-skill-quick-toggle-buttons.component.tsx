import { MasterServantSkillLevel } from '@fgo-planner/types';
import { AddBox as AddBoxIcon, IndeterminateCheckBoxOutlined as IndeterminateCheckBoxOutlinedIcon, Looks6Outlined as Looks6OutlinedIcon, LooksOneOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React from 'react';
import { GameServantConstants } from '../../../constants';
import { ComponentStyleProps } from '../../../types/internal';

type Props = {
    disabled?: boolean;
    ignoreTabNavigation?: boolean;
    onClick?: (value: MasterServantSkillLevel | undefined, stat: 'skills' | 'appendSkills') => void;
    stat: 'skills' | 'appendSkills';
    /**
     * Whether to show the button that clear all values instead of the button that
     * sets all values to 1.
     */
    useClearValuesButton?: boolean;
} & Pick<ComponentStyleProps, 'className'>;

const TooltipEnterDelay = 250;

export const StyleClassPrefix = 'ServantSkillQuickToggleButtons';

const StyleProps = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    width: 120,
    '& .inverted': {
        transform: 'rotate(180deg)'
    }
} as SystemStyleObject<Theme>;

/**
 * Buttons for quickly toggling a servant's skill levels to all 1's, 9's, or
 * 10's.
 */
export const ServantSkillQuickToggleButtons = React.memo((props: Props) => {

    const {
        disabled,
        ignoreTabNavigation,
        onClick,
        stat,
        useClearValuesButton,
        className
    } = props;

    const tabIndex = ignoreTabNavigation ? -1 : 0;

    return (
        <Box className={clsx(`${StyleClassPrefix}-root`, className)} sx={StyleProps}>
            {useClearValuesButton ? (
                <Tooltip title='Clear all' enterDelay={TooltipEnterDelay}>
                    <IconButton
                        color='primary'
                        onClick={() => onClick?.(undefined, stat)}
                        tabIndex={tabIndex}
                        disabled={disabled}
                    >
                        <IndeterminateCheckBoxOutlinedIcon />
                    </IconButton>
                </Tooltip>
            ) : (
                <Tooltip title={`Set all to ${GameServantConstants.MinSkillLevel}`} enterDelay={TooltipEnterDelay}>
                    <IconButton
                        color='primary'
                        onClick={() => onClick?.(GameServantConstants.MinSkillLevel, stat)}
                        tabIndex={tabIndex}
                        disabled={disabled}
                    >
                        <LooksOneOutlined />
                    </IconButton>
                </Tooltip>
            )}
            <Tooltip title='Set all to 9' enterDelay={TooltipEnterDelay}>
                <IconButton
                    color='primary'
                    onClick={() => onClick?.(9, stat)}
                    tabIndex={tabIndex}
                    disabled={disabled}
                >
                    <Looks6OutlinedIcon className='inverted' />
                </IconButton>
            </Tooltip>
            <Tooltip title={`Set all to ${GameServantConstants.MaxSkillLevel}`} enterDelay={TooltipEnterDelay}>
                <IconButton
                    color='primary'
                    onClick={() => onClick?.(GameServantConstants.MaxSkillLevel, stat)}
                    tabIndex={tabIndex}
                    disabled={disabled}
                >
                    <AddBoxIcon />
                </IconButton>
            </Tooltip>
        </Box>
    );

});

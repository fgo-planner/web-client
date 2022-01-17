import { IndeterminateCheckBoxOutlined as IndeterminateCheckBoxOutlinedIcon, OneKOutlined as OneKOutlinedIcon, TwoK as TwoKIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React from 'react';
import { GameServantConstants } from '../../../constants';
import { ComponentStyleProps } from '../../../types/internal';

type Props = {
    disabled?: boolean;
    ignoreTabNavigation?: boolean;
    onClick?: (value: number) => void;
} & Pick<ComponentStyleProps, 'className'>;

const TooltipEnterDelay = 250;

export const StyleClassPrefix = 'ServantFouQuickToggleButtons';

const StyleProps = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    width: 120
} as SystemStyleObject<Theme>;

/**
 * Buttons for quickly toggling a servant's fou enhancement value to both 0,
 * 1000, or 2000.
 */
export const ServantFouQuickToggleButtons = React.memo((props: Props) => {

    const {
        disabled,
        ignoreTabNavigation,
        onClick,
        className
    } = props;

    const tabIndex = ignoreTabNavigation ? -1 : 0;

    return (
        <Box className={clsx(`${StyleClassPrefix}-root`, className)} sx={StyleProps}>
            <Tooltip title={`Set both to ${GameServantConstants.MinFou}`} enterDelay={TooltipEnterDelay}>
                <IconButton
                    color='primary'
                    onClick={() => onClick?.(GameServantConstants.MinFou)}
                    tabIndex={tabIndex}
                    disabled={disabled}
                >
                    <IndeterminateCheckBoxOutlinedIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title='Set both to 1000' enterDelay={TooltipEnterDelay}>
                <IconButton
                    color='primary'
                    onClick={() => onClick?.(1000)}
                    tabIndex={tabIndex}
                    disabled={disabled}
                >
                    <OneKOutlinedIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title={`Set both to ${GameServantConstants.MaxFou}`} enterDelay={TooltipEnterDelay}>
                <IconButton
                    color='primary'
                    onClick={() => onClick?.(GameServantConstants.MaxFou)}
                    tabIndex={tabIndex}
                    disabled={disabled}
                >
                    <TwoKIcon />
                </IconButton>
            </Tooltip>
        </Box>
    );

});

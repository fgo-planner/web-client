import { IconButton, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEventHandler, ReactNode } from 'react';
import { ComponentStyleProps } from '../../../types/internal';

type Props = {
    disabled?: boolean;
    centerButtonIcon: ReactNode;
    centerButtonTooltip?: string;
    ignoreTabNavigation?: boolean;
    leftButtonIcon: ReactNode;
    leftButtonTooltip?: string;
    onCenterButtonClick?: MouseEventHandler;
    onLeftButtonClick?: MouseEventHandler;
    onRightButtonClick?: MouseEventHandler;
    rightButtonIcon: ReactNode;
    rightButtonTooltip?: string
} & Pick<ComponentStyleProps, 'className'>;

const TooltipEnterDelay = 250;

const StyleClassPrefix = 'ServantEnhancementQuickToggleButtons';

const StyleProps = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    width: 40
} as SystemStyleObject<Theme>;

export const ServantEnhancementQuickToggleButtons = React.memo((props: Props) => {

    const {
        disabled,
        centerButtonIcon,
        centerButtonTooltip,
        ignoreTabNavigation,
        leftButtonIcon,
        leftButtonTooltip,
        onCenterButtonClick,
        onLeftButtonClick,
        onRightButtonClick,
        rightButtonIcon,
        rightButtonTooltip,
        className
    } = props;

    const tabIndex = ignoreTabNavigation ? -1 : 0;

    return (
        <Box className={clsx(`${StyleClassPrefix}-root`, className)} sx={StyleProps}>
            <Tooltip title={leftButtonTooltip || ''} enterDelay={TooltipEnterDelay}>
                <IconButton
                    color='primary'
                    onClick={onLeftButtonClick}
                    tabIndex={tabIndex}
                    disabled={disabled}
                >
                    {leftButtonIcon}
                </IconButton>
            </Tooltip>
            <Tooltip title={centerButtonTooltip || ''} enterDelay={TooltipEnterDelay}>
                <IconButton
                    color='primary'
                    onClick={onCenterButtonClick}
                    tabIndex={tabIndex}
                    disabled={disabled}
                >
                    {centerButtonIcon}
                </IconButton>
            </Tooltip>
            <Tooltip title={rightButtonTooltip || ''} enterDelay={TooltipEnterDelay}>
                <IconButton
                    color='primary'
                    onClick={onRightButtonClick}
                    tabIndex={tabIndex}
                    disabled={disabled}
                >
                    {rightButtonIcon}
                </IconButton>
            </Tooltip>
        </Box>
    );

});

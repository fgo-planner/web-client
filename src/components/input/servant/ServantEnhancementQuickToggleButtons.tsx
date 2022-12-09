import { IconButton, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEventHandler, ReactNode } from 'react';
import { ComponentStyleProps } from '../../../types';

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

/**
 * Wrapping this component in React.memo is unnecessary because a re-render of
 * the parent components will always trigger a re-render of this component
 * anyways.
 */
/** */
export const ServantEnhancementQuickToggleButtons: React.FC<Props> = (props: Props): JSX.Element => {

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
                <div>
                    <IconButton
                        color='primary'
                        onClick={onLeftButtonClick}
                        tabIndex={tabIndex}
                        disabled={disabled}
                        >
                        {leftButtonIcon}
                    </IconButton>
                </div>
            </Tooltip>
            <Tooltip title={centerButtonTooltip || ''} enterDelay={TooltipEnterDelay}>
                <div>
                    <IconButton
                        color='primary'
                        onClick={onCenterButtonClick}
                        tabIndex={tabIndex}
                        disabled={disabled}
                    >
                        {centerButtonIcon}
                    </IconButton>
                </div>
            </Tooltip>
            <Tooltip title={rightButtonTooltip || ''} enterDelay={TooltipEnterDelay}>
                <div>
                    <IconButton
                        color='primary'
                        onClick={onRightButtonClick}
                        tabIndex={tabIndex}
                        disabled={disabled}
                    >
                        {rightButtonIcon}
                    </IconButton>
                </div>
            </Tooltip>
        </Box>
    );

};

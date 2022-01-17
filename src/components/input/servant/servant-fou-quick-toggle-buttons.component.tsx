/* eslint-disable no-unreachable */
import { OneKOutlined as OneKOutlinedIcon, TwoK as TwoKIcon } from '@mui/icons-material';
import clsx from 'clsx';
import React from 'react';
import { GameServantConstants } from '../../../constants';
import { ComponentStyleProps } from '../../../types/internal';
import { ZeroOutlinedIcon } from '../../icons';
import { ServantEnhancementQuickToggleButtons } from './servant-enhancement-quick-toggle-buttons.component';

type Props = {
    disabled?: boolean;
    ignoreTabNavigation?: boolean;
    onClick?: (value: number) => void;
} & Pick<ComponentStyleProps, 'className'>;

const StyleClassPrefix = 'ServantFouQuickToggleButtons';

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

    return (
        <ServantEnhancementQuickToggleButtons
            className={clsx(`${StyleClassPrefix}-root`, className)}
            ignoreTabNavigation={ignoreTabNavigation}
            disabled={disabled}

            // Left button
            leftButtonIcon={<ZeroOutlinedIcon />}
            leftButtonTooltip={`Set both to ${GameServantConstants.MinFou}`}
            onLeftButtonClick={() => onClick?.(GameServantConstants.MinFou)}

            // Center button
            centerButtonIcon={<OneKOutlinedIcon />}
            centerButtonTooltip='Set both to 1000'
            onCenterButtonClick={() => onClick?.(1000)}

            // Right button
            rightButtonIcon={<TwoKIcon />}
            rightButtonTooltip={`Set both to ${GameServantConstants.MaxFou}`}
            onRightButtonClick={() => onClick?.(GameServantConstants.MaxFou)}

        />
    );

});

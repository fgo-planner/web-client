/* eslint-disable no-unreachable */
import clsx from 'clsx';
import React from 'react';
import { GameServantConstants } from '../../../constants';
import { ComponentStyleProps } from '../../../types/internal';
import { IconButtonText } from '../../text/icon-button-text.component';
import { ServantEnhancementQuickToggleButtons } from './servant-enhancement-quick-toggle-buttons.component';

type Props = {
    disabled?: boolean;
    ignoreTabNavigation?: boolean;
    onClick: (value: number) => void;
} & Pick<ComponentStyleProps, 'className'>;

const StyleClassPrefix = 'ServantFouQuickToggleButtons';

/**
 * The usage of `useMemo`, `useCallback`, etc. hooks in this component are
 * unnecessary because this is is never re-rendered (due to prop values never
 * changing).
 */

/**
 * Buttons for quickly toggling a servant's fou enhancement value to 0, 1000, or
 * 2000.
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
            leftButtonIcon={<IconButtonText children={0} />}
            leftButtonTooltip={`Set both to ${GameServantConstants.MinFou}`}
            onLeftButtonClick={() => onClick(GameServantConstants.MinFou)}

            // Center button
            centerButtonIcon={<IconButtonText children='1k' />}
            centerButtonTooltip='Set both to 1000'
            onCenterButtonClick={() => onClick(1000)}

            // Right button
            rightButtonIcon={<IconButtonText textDecoration='overline' children='2k' />}
            rightButtonTooltip={`Set both to ${GameServantConstants.MaxFou}`}
            onRightButtonClick={() => onClick(GameServantConstants.MaxFou)}
        />
    );

});

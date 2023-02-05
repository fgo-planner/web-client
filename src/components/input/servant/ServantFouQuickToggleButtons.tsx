import { InstantiatedServantConstants } from '@fgo-planner/data-core';
import clsx from 'clsx';
import React from 'react';
import { ComponentStyleProps } from '../../../types';
import { IconButtonText } from '../../text/IconButtonText';
import { ServantEnhancementQuickToggleButtons } from './ServantEnhancementQuickToggleButtons';

type Props = {
    disabled?: boolean;
    ignoreTabNavigation?: boolean;
    onClick: (value: number) => void;
} & Pick<ComponentStyleProps, 'className'>;

const StyleClassPrefix = 'ServantFouQuickToggleButtons';

/**
 * The usage of `useMemo`, `useCallback`, etc. hooks in this component are
 * unnecessary because it is intended to be used in a way such that the prop
 * values never change (hence the component is never re-rendered after the
 * initial mount).
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
            leftButtonTooltip={`Set both to ${InstantiatedServantConstants.MinFou}`}
            onLeftButtonClick={() => onClick(InstantiatedServantConstants.MinFou)}

            // Center button
            centerButtonIcon={<IconButtonText children='1k' />}
            centerButtonTooltip='Set both to 1000'
            onCenterButtonClick={() => onClick(1000)}

            // Right button
            rightButtonIcon={<IconButtonText textDecoration='overline' children='2k' />}
            rightButtonTooltip={`Set both to ${InstantiatedServantConstants.MaxFou}`}
            onRightButtonClick={() => onClick(InstantiatedServantConstants.MaxFou)}
        />
    );

});

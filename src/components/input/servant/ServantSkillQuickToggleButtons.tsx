import { InstantiatedServantSkillLevel } from '@fgo-planner/data-core';
import clsx from 'clsx';
import React, { MouseEventHandler, ReactNode } from 'react';
import { ComponentStyleProps } from '../../../types';
import { IconButtonText } from '../../text/icon-button-text.component';
import { ServantEnhancementQuickToggleButtons } from './ServantEnhancementQuickToggleButtons';

type SkillSet = 'skills' | 'appendSkills';

type ToggleTarget = 0 | InstantiatedServantSkillLevel;

type Props = {
    centerToggleTarget: ToggleTarget;
    disabled?: boolean;
    ignoreTabNavigation?: boolean;
    leftToggleTarget: ToggleTarget;
    rightToggleTarget: ToggleTarget;
    skillSet: SkillSet;
    onClick: (value: InstantiatedServantSkillLevel | null, skillSet: SkillSet) => void;
} & Pick<ComponentStyleProps, 'className'>;

const renderButtonIcon = (target: ToggleTarget): ReactNode => {
    const text = target === 0 ? '\u2013' : target;
    const textDecoration = target === 10 ? 'overline' : 'none';
    return (
        <IconButtonText textDecoration={textDecoration}>
            {text}
        </IconButtonText>
    );
};

const renderTooltipTitle = (target: ToggleTarget): string => {
    if (target === 0) {
        return 'Clear all';
    }
    return `Set all to ${target}`;
};

const StyleClassPrefix = 'ServantSkillQuickToggleButtons';

/**
 * The usage of `useMemo`, `useCallback`, etc. hooks in this component are
 * unnecessary because it is intended to be used in a way such that the prop
 * values never change (hence the component is never re-rendered after the
 * initial mount).
 */

/**
 * Buttons for quickly toggling a servant's skill/append levels to the specified
 * target values.
 */
export const ServantSkillQuickToggleButtons = React.memo((props: Props) => {

    const {
        centerToggleTarget,
        disabled,
        ignoreTabNavigation,
        leftToggleTarget,
        rightToggleTarget,
        skillSet,
        onClick,
        className
    } = props;


    const createClickHandler = (target: ToggleTarget): MouseEventHandler => {
        return () => onClick(target || null, skillSet);
    };

    return (
        <ServantEnhancementQuickToggleButtons
            className={clsx(`${StyleClassPrefix}-root`, className)}
            ignoreTabNavigation={ignoreTabNavigation}
            disabled={disabled}

            // Left button
            leftButtonIcon={renderButtonIcon(leftToggleTarget)}
            leftButtonTooltip={renderTooltipTitle(leftToggleTarget)}
            onLeftButtonClick={createClickHandler(leftToggleTarget)}

            // Center button
            centerButtonIcon={renderButtonIcon(centerToggleTarget)}
            centerButtonTooltip={renderTooltipTitle(centerToggleTarget)}
            onCenterButtonClick={createClickHandler(centerToggleTarget)}

            // Right button
            rightButtonIcon={renderButtonIcon(rightToggleTarget)}
            rightButtonTooltip={renderTooltipTitle(rightToggleTarget)}
            onRightButtonClick={createClickHandler(rightToggleTarget)}
        />
    );

});

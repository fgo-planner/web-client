import { MasterServantSkillLevel } from '@fgo-planner/data-core';
import clsx from 'clsx';
import React, { MouseEventHandler, ReactNode } from 'react';
import { ComponentStyleProps } from '../../../types/internal';
import { IconButtonText } from '../../text/icon-button-text.component';
import { ServantEnhancementQuickToggleButtons } from './servant-enhancement-quick-toggle-buttons.component';

type SkillSet = 'skills' | 'appendSkills';

type ToggleTarget = 0 | MasterServantSkillLevel;

type Props = {
    centerToggleTarget: ToggleTarget;
    disabled?: boolean;
    ignoreTabNavigation?: boolean;
    leftToggleTarget: ToggleTarget;
    onClick: (value: MasterServantSkillLevel | null, skillSet: SkillSet) => void;
    rightToggleTarget: ToggleTarget;
    skillSet: SkillSet;
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
 * unnecessary because this is is never re-rendered (due to prop values never
 * changing).
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
        onClick,
        rightToggleTarget,
        skillSet,
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

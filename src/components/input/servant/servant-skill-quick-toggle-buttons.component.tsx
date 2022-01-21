import { MasterServantSkillLevel } from '@fgo-planner/types';
import { IndeterminateCheckBoxOutlined as IndeterminateCheckBoxOutlinedIcon, LooksOneOutlined } from '@mui/icons-material';
import clsx from 'clsx';
import React from 'react';
import { GameServantConstants } from '../../../constants';
import { ComponentStyleProps } from '../../../types/internal';
import { NineOutlinedIcon, TenOutlinedIcon } from '../../icons';
import { ServantEnhancementQuickToggleButtons } from './servant-enhancement-quick-toggle-buttons.component';

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

const StyleClassPrefix = 'ServantSkillQuickToggleButtons';

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

    return (
        <ServantEnhancementQuickToggleButtons
            className={clsx(`${StyleClassPrefix}-root`, className)}
            ignoreTabNavigation={ignoreTabNavigation}
            disabled={disabled}

            // Left button
            leftButtonIcon={useClearValuesButton ? <IndeterminateCheckBoxOutlinedIcon /> : <LooksOneOutlined />}
            leftButtonTooltip={useClearValuesButton ? 'Clear all' : `Set all to ${GameServantConstants.MinSkillLevel}`}
            onLeftButtonClick={() => onClick?.(useClearValuesButton ? undefined : GameServantConstants.MinSkillLevel, stat)}

            // Center button
            centerButtonIcon={<NineOutlinedIcon />}
            centerButtonTooltip='Set all to 9'
            onCenterButtonClick={() => onClick?.(9, stat)}

            // Right button
            rightButtonIcon={<TenOutlinedIcon />}
            rightButtonTooltip={`Set all to ${GameServantConstants.MaxSkillLevel}`}
            onRightButtonClick={() => onClick?.(GameServantConstants.MaxSkillLevel, stat)}
        />
    );

});

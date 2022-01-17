import { MasterServantAscensionLevel } from '@fgo-planner/types';
import { LooksOneOutlined as LooksOneOutlinedIcon } from '@mui/icons-material';
import clsx from 'clsx';
import React from 'react';
import { GameServantConstants } from '../../../constants';
import { ComponentStyleProps } from '../../../types/internal';
import { NinetyOutlinedIcon, OneHundredIcon } from '../../icons';
import { ServantEnhancementQuickToggleButtons } from './servant-enhancement-quick-toggle-buttons.component';

type Props = {
    disabled?: boolean;
    ignoreTabNavigation?: boolean;
    onClick?: (level: number, ascension: MasterServantAscensionLevel) => void;
    /**
     * The servant's natural max level.
     */
    servantMaxLevel: number;
} & Pick<ComponentStyleProps, 'className'>;

// const MaxLevel = GameServantConstants.MaxLevel;
const MaxLevel = 100;

const StyleClassPrefix = 'ServantLevelQuickToggleButtons';

/**
 * Button for quickly toggling a servant's level between min and max.
 */
export const ServantLevelQuickToggleButtons = React.memo((props: Props) => {

    const {
        disabled,
        ignoreTabNavigation,
        onClick,
        servantMaxLevel,
        className
    } = props;

    return (
        <ServantEnhancementQuickToggleButtons
            className={clsx(`${StyleClassPrefix}-root`, className)}
            ignoreTabNavigation={ignoreTabNavigation}
            disabled={disabled}

            // Left button
            leftButtonIcon={<LooksOneOutlinedIcon />}
            leftButtonTooltip={`Set level to ${GameServantConstants.MinLevel}`}
            onLeftButtonClick={() => onClick?.(GameServantConstants.MinLevel, GameServantConstants.MinAscensionLevel)}

            // Center button
            centerButtonIcon={<NinetyOutlinedIcon />}
            centerButtonTooltip={`Set level to ${servantMaxLevel}`}
            onCenterButtonClick={() => onClick?.(servantMaxLevel, GameServantConstants.MaxAscensionLevel)}

            // Right button
            rightButtonIcon={<OneHundredIcon />}
            rightButtonTooltip={`Set level to ${MaxLevel}`}
            onRightButtonClick={() => onClick?.(MaxLevel, GameServantConstants.MaxAscensionLevel)}
        />
    );

});

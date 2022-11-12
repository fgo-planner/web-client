import { InstantiatedServantAscensionLevel, InstantiatedServantConstants } from '@fgo-planner/data-core';
import { WineBarOutlined } from '@mui/icons-material';
import clsx from 'clsx';
import React, { useCallback } from 'react';
import { ComponentStyleProps } from '../../../types/internal';
import { IconButtonText } from '../../text/icon-button-text.component';
import { ServantEnhancementQuickToggleButtons } from './servant-enhancement-quick-toggle-buttons.component';

type Props = {
    disabled?: boolean;
    ignoreTabNavigation?: boolean;
    /**
     * The servant's natural max level.
     */
    maxNaturalLevel: number;
    onClick: (level: number, ascension: InstantiatedServantAscensionLevel) => void;
} & Pick<ComponentStyleProps, 'className'>;

const StyleClassPrefix = 'ServantLevelQuickToggleButtons';

/**
 * Button for quickly toggling a servant's level between min and max.
 */
export const ServantLevelQuickToggleButtons = React.memo((props: Props) => {

    const {
        disabled,
        ignoreTabNavigation,
        onClick,
        maxNaturalLevel,
        className
    } = props;

    const handleLeftButtonClick = useCallback((): void => {
        onClick(InstantiatedServantConstants.MinLevel, InstantiatedServantConstants.MinAscensionLevel);
    }, [onClick]);

    const handleCenterButtonClick = useCallback((): void => {
        onClick(maxNaturalLevel, InstantiatedServantConstants.MaxAscensionLevel);
    }, [onClick, maxNaturalLevel]);

    const handleRightButtonClick = useCallback((): void => {
        onClick(100, InstantiatedServantConstants.MaxAscensionLevel);
    }, [onClick]);

    return (
        <ServantEnhancementQuickToggleButtons
            className={clsx(`${StyleClassPrefix}-root`, className)}
            ignoreTabNavigation={ignoreTabNavigation}
            disabled={disabled}

            // Left button
            leftButtonIcon={<IconButtonText children={1} />}
            leftButtonTooltip={`Set level to ${InstantiatedServantConstants.MinLevel}`}
            onLeftButtonClick={handleLeftButtonClick}

            // Center button
            centerButtonIcon={<IconButtonText children={maxNaturalLevel} />}
            centerButtonTooltip={`Set level to ${maxNaturalLevel}`}
            onCenterButtonClick={handleCenterButtonClick}

            // Right button
            rightButtonIcon={<WineBarOutlined />}
            rightButtonTooltip={'Set level to 100'}
            onRightButtonClick={handleRightButtonClick}
        />
    );

});

import { InstantiatedServantAscensionLevel, InstantiatedServantConstants } from '@fgo-planner/data-core';
import clsx from 'clsx';
import React, { useCallback } from 'react';
import { ComponentStyleProps } from '../../../types';
import { IconOutlined } from '../../icons/IconOutlined';
import { IconButtonText } from '../../text/IconButtonText';
import { ServantEnhancementQuickToggleButtons } from './ServantEnhancementQuickToggleButtons';

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
        maxNaturalLevel,
        onClick,
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
            leftButtonIcon={<IconButtonText>1</IconButtonText>}
            leftButtonTooltip={`Set level to ${InstantiatedServantConstants.MinLevel}`}
            onLeftButtonClick={handleLeftButtonClick}

            // Center button
            centerButtonIcon={<IconButtonText>{maxNaturalLevel}</IconButtonText>}
            centerButtonTooltip={`Set level to ${maxNaturalLevel}`}
            onCenterButtonClick={handleCenterButtonClick}

            // Right button
            rightButtonIcon={<IconOutlined>wine_bar</IconOutlined>}
            rightButtonTooltip={'Set level to 100'}
            onRightButtonClick={handleRightButtonClick}
        />
    );

});

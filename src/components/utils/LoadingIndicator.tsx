import { CircularProgress } from '@mui/material';
import { FilteringStyledOptions } from '@mui/styled-engine';
import { CSSInterpolation, MuiStyledOptions, styled } from '@mui/system';
import clsx from 'clsx';
import React from 'react';
import { useActiveBreakpoints } from '../../hooks/user-interface/useActiveBreakpoints';
import { ThemeConstants } from '../../styles/ThemeConstants';
import { StyledFunctionThemeProp } from '../../types';

type Props = {
    visible?: boolean;
    zIndex?: number;
};

const CircularProgressThickness = 3.7;

/**
 * MuiDialogs are 1300 by default, the loading indicator should be rendered
 * above dialogs in most cases.
 */
const DefaultZIndex = 1337;

const IndicatorSizeLarge = 160;
const IndicatorSizeMedium = 150;
const IndicatorSizeSmall = 120;

const StyleClassPrefix = 'LoadingIndicator';

const shouldForwardProp = (prop: PropertyKey): prop is keyof Props => (
    prop !== 'zIndex' &&
    prop !== 'visible'
);

const StyledOptions = {
    shouldForwardProp,
    skipSx: true,
    skipVariantsResolver: true
} as MuiStyledOptions & FilteringStyledOptions<Props>;

const StyleProps = (props: Props & StyledFunctionThemeProp) => {

    const { zIndex = DefaultZIndex } = props;

    return {
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        zIndex,
        [`& .${StyleClassPrefix}-progress-container`]: {
            paddingTop: '25vh'
        }
    } as CSSInterpolation;
};

const RootComponent = styled('div', StyledOptions)<Props>(StyleProps);

export const LoadingIndicator = React.memo((props: Props) => {

    const {
        visible,
        zIndex
    } = props;

    const { sm, md } = useActiveBreakpoints();

    if (visible === false) {
        return null;
    }

    let indicatorSize: number;
    if (md) {
        indicatorSize = IndicatorSizeLarge;
    } else if (sm) {
        indicatorSize = IndicatorSizeMedium;
    } else {
        indicatorSize = IndicatorSizeSmall;
    }

    const classNames = clsx(
        `${StyleClassPrefix}-root`,
        ThemeConstants.ClassBackdropBlur
    );

    return (
        <RootComponent className={classNames} zIndex={zIndex}>
            <div className={`${StyleClassPrefix}-progress-container`}>
                <CircularProgress
                    size={indicatorSize}
                    thickness={CircularProgressThickness}
                />
            </div>
        </RootComponent>
    );

});

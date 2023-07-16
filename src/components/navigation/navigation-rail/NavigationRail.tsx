import { Theme } from '@mui/material';
import { FilteringStyledOptions } from '@mui/styled-engine';
import { CSSInterpolation, MuiStyledOptions, styled } from '@mui/system';
import { PropsWithChildren } from 'react';
import { ThemeConstants } from '../../../styles/ThemeConstants';
import { StyledFunctionThemeProp } from '../../../types';

type Props = PropsWithChildren<{
    /**
     * Displays a right border when `layout` is set to `column`, or a bottom border
     * when `layout` is set to `row`.
     */
    border?: boolean;
    /**
     * (optional) Defaults to `column`.
     */
    layout?: 'row' | 'column';
}>;

const StyleClassPrefix = 'NavigationRail';

const shouldForwardProp = (prop: PropertyKey): prop is keyof Props => (
    prop !== 'border'
);

const StyledOptions = {
    name: StyleClassPrefix,
    shouldForwardProp,
    slot: 'root',
    skipSx: true,
    skipVariantsResolver: true
} as MuiStyledOptions & FilteringStyledOptions<Props>;

const BaseStyleProps = (_props: Props & StyledFunctionThemeProp) => ({
    display: 'flex',
    alignItems: 'center'
} as CSSInterpolation);

const LayoutStyleProps = (props: Props & StyledFunctionThemeProp) => {

    const {
        layout,
        theme
    } = props;

    const { spacing } = theme as Theme;

    if (layout !== 'row') {
        return {
            flexDirection: 'column',
            width: spacing(ThemeConstants.NavigationRailSizeScale),
            height: '100%',
            paddingTop: spacing(2),
            '& >*': {
                // https://material.io/components/navigation-rail#specs
                paddingTop: spacing(1)
            },
            '& >.MuiDivider-root': {
                width: '50%',
                paddingTop: 0,
                marginTop: spacing(4)
            }
        } as CSSInterpolation;
    }

    return {
        width: '100%',
        height: spacing(ThemeConstants.NavigationRailSizeScale),
        padding: spacing(0, 1),
        '& >*': {
            paddingLeft: spacing(0.75)
        },
        '& >.MuiDivider-root': {
            display: 'none'
        }
    } as CSSInterpolation;

};

const BorderStyleProps = (props: Props & StyledFunctionThemeProp) => {

    const {
        border,
        layout,
        theme
    } = props;

    if (!border) {
        return;
    }

    const { palette } = theme as Theme;

    if (layout !== 'row') {
        return {
            borderRightWidth: 1,
            borderRightStyle: 'solid',
            borderRightColor: palette.divider
        } as CSSInterpolation;
    }

    return {
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: palette.divider
    } as CSSInterpolation;
};

export const NavigationRail = styled('div', StyledOptions)<Props>(
    BaseStyleProps,
    LayoutStyleProps,
    BorderStyleProps
);

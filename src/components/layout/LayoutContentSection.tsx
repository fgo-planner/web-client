import { FilteringStyledOptions } from '@mui/styled-engine';
import { CSSInterpolation, MuiStyledOptions, styled, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { DOMAttributes, PropsWithChildren } from 'react';
import { ThemeConstants } from '../../styles/ThemeConstants';
import { ComponentStyleProps, StyledFunctionThemeProp } from '../../types';
import { LayoutPanel, StyleClassPrefix as LayoutPanelStyleClassPrefix } from './LayoutPanel';

type Props = PropsWithChildren<{
    autoContentHeight?: boolean;
    fullHeight?: boolean;
    layout?: 'row' | 'column'
    scrollbarTrackBorder?: boolean
}> & ComponentStyleProps & DOMAttributes<HTMLDivElement>;

export const StyleClassPrefix = 'LayoutContentSection';

const shouldForwardProp = (prop: PropertyKey): prop is keyof Props => {
    return (
        prop !== 'autoContentHeight' &&
        prop !== 'fullHeight' &&
        prop !== 'layout'
    );
};

const StyledOptions = {
    shouldForwardProp,
    skipVariantsResolver: true
} as MuiStyledOptions & FilteringStyledOptions<Props>;

const StyleProps = (props: Props & StyledFunctionThemeProp) => {
    return {
        overflow: 'hidden',
        boxSizing: 'border-box'
    } as CSSInterpolation;
};

const AutoContentsHeightStyleProps = (props: Props & StyledFunctionThemeProp) => {
    const { autoContentHeight } = props;
    let contentsProps: SystemStyleObject<Theme>;
    if (!autoContentHeight) {
        contentsProps = {
            height: '100%'
        };
    } else {
        contentsProps = {
            height: 'initial',
            maxHeight: '100%'
        };
    }
    return {
        [`& .${LayoutPanelStyleClassPrefix}-root`]: contentsProps
    };
};

const FullHeightStyleProps = (props: Props & { theme: Theme }) => {
    const { fullHeight } = props;
    if (!fullHeight) {
        return;
    }
    return {
        height: '100%'
    } as CSSInterpolation;
};

const LayoutStyleProps = (props: Props & { theme: Theme }) => {
    const { layout } = props;
    if (!layout) {
        return;
    }
    return {
        display: 'flex',
        flexDirection: layout
    } as CSSInterpolation;
};

const RootComponent = styled('div', StyledOptions)<Props>(
    StyleProps,
    AutoContentsHeightStyleProps,
    FullHeightStyleProps,
    LayoutStyleProps
);

export const LayoutContentSection = React.memo((props: Props) => {

    const {
        scrollbarTrackBorder,
        children,
        className: classNameProp,
        ...componentProps
    } = props;

    const className = clsx(
        `${StyleClassPrefix}-root`,
        scrollbarTrackBorder && ThemeConstants.ClassScrollbarTrackBorder,
        classNameProp
    );

    return (
        <RootComponent className={className} {...componentProps}>
            <LayoutPanel>
                {children}
            </LayoutPanel>
        </RootComponent>
    );

});

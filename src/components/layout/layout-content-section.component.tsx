import { FilteringStyledOptions } from '@mui/styled-engine';
import { CSSProperties } from '@mui/styles';
import { MuiStyledOptions, styled, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { DOMAttributes, PropsWithChildren } from 'react';
import { ThemeConstants } from '../../styles/theme-constants';
import { ComponentStyleProps } from '../../types/internal';
import { LayoutPanel, StyleClassPrefix as LayoutPanelStyleClassPrefix } from './layout-panel.component';

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

const StyleOptions = {
    shouldForwardProp,
    skipVariantsResolver: true
} as MuiStyledOptions & FilteringStyledOptions<Props>;

const StyleProps = (props: Props & { theme: Theme }) => {
    return {
        overflow: 'hidden',
        boxSizing: 'border-box'
    } as CSSProperties;
};

const AutoContentsHeightStyleProps = (props: Props & { theme: Theme }) => {
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
    } as CSSProperties;
};

const LayoutStyleProps = (props: Props & { theme: Theme }) => {
    const { layout } = props;
    if (!layout) {
        return;
    }
    return {
        display: 'flex',
        flexDirection: layout
    } as CSSProperties;
};

const RootComponent = styled('div', StyleOptions)<Props>(
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

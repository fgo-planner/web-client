import { Theme } from '@mui/material';
import { FilteringStyledOptions } from '@mui/styled-engine';
import { CSSProperties } from '@mui/styles';
import { alpha, styled, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { DOMAttributes, PropsWithChildren, ReactNode } from 'react';
import { ComponentStyleProps } from '../../types/internal';

type Props = PropsWithChildren<{
    active?: boolean;
    borderTop?: boolean;
    borderBottom?: boolean;
    stickyContent?: ReactNode;
}> & ComponentStyleProps & DOMAttributes<HTMLDivElement>;

const StyleClassPrefix = 'DataTableGridCell';

const shouldForwardProp = (prop: PropertyKey): prop is keyof Props => (
    prop !== 'active' &&
    prop !== 'borderTop' &&
    prop !== 'borderBottom' &&
    prop !== 'stickyContent'
);

const StyleOptions = {
    name: StyleClassPrefix,
    slot: 'root',
    skipVariantsResolver: true,
    shouldForwardProp
} as FilteringStyledOptions<Props>;

const StyleProps = (props: Props & { theme: SystemTheme }) => {

    const { palette } = props.theme as Theme;

    return {
        display: 'flex',
        width: 'fit-content',
        backgroundColor: palette.background.paper,
        '&.active': {
            backgroundColor: `${alpha(palette.primary.main, 0.07)} !important`
        },
        '&.border-top': {
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: palette.divider,
        },
        '&.border-bottom': {
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: palette.divider,
        },
        '& .sticky-content': {
            position: 'sticky',
            left: 0,
            zIndex: 2,
            borderRightWidth: 1,
            borderRightStyle: 'solid',
            borderRightColor: palette.divider
        }
    } as CSSProperties;
};

const RootComponent = styled('div', StyleOptions)<Props>(StyleProps);

export const DataTableGridRow = React.memo((props: Props) => {

    const {
        children,
        active,
        borderTop,
        borderBottom,
        stickyContent,
        className,
        style,
        sx,
        ...domAttributes
    } = props;

    const classNames = clsx(
        className,
        active && 'active',
        borderTop && 'border-top',
        borderBottom && 'border-bottom'
    );

    return (
        <RootComponent
            className={classNames}
            style={style}
            sx={sx}
            {...domAttributes}
        >
            {stickyContent && <div className='sticky-content'>
                {stickyContent}
            </div>}
            {children}
        </RootComponent>
    );

});

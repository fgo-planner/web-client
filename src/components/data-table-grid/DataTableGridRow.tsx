import { CSSInterpolation, Theme } from '@mui/material';
import { FilteringStyledOptions } from '@mui/styled-engine';
import { styled } from '@mui/system';
import clsx from 'clsx';
import React, { DOMAttributes, PropsWithChildren, ReactNode } from 'react';
import { ComponentStyleProps, StyledFunctionThemeProp } from '../../types';

type Props = PropsWithChildren<{
    borderBottom?: boolean;
    borderTop?: boolean;
    stickyContent?: ReactNode;
}> & ComponentStyleProps & DOMAttributes<HTMLDivElement>;

const StyleClassPrefix = 'DataTableGridRow';

const shouldForwardProp = (prop: PropertyKey): prop is keyof Props => (
    prop !== 'borderBottom' &&
    prop !== 'borderTop' &&
    prop !== 'stickyContent' &&
    prop !== 'sx'
);

const StyledOptions = {
    name: StyleClassPrefix,
    slot: 'root',
    skipVariantsResolver: true,
    shouldForwardProp
} as FilteringStyledOptions<Props>;

const StyleProps = (props: Props & StyledFunctionThemeProp) => {

    const { palette } = props.theme as Theme;

    return {
        display: 'flex',
        width: 'fit-content',
        backgroundColor: palette.background.paper,
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
    } as CSSInterpolation;
};

const RootComponent = styled('div', StyledOptions)<Props>(StyleProps);

export const DataTableGridRow = React.memo((props: Props) => {

    const {
        children,
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

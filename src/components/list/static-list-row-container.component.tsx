import { MuiStyledOptions, styled } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEventHandler, PropsWithChildren } from 'react';
import { ComponentStyleProps } from '../../types/internal';
import listRowStyle from './list-row-style';

// TODO Add prop for cursor style.
type Props = PropsWithChildren<{
    active?: boolean;
    borderTop?: boolean;
    borderBottom?: boolean;
    onClick?: MouseEventHandler<HTMLDivElement>;
}> & ComponentStyleProps;

export const StyleClassPrefix = 'StaticListRowContainer';

const StyleOptions = {
    name: StyleClassPrefix
} as MuiStyledOptions;

const RootComponent = styled('div', StyleOptions)(({ theme }) => {
    return listRowStyle(theme) as any; // TODO Find out which type this is supposed to be.
});

export const StaticListRowContainer = React.memo((props: Props) => {

    const {
        children,
        active,
        borderTop,
        borderBottom,
        onClick,
        className,
        style,
        sx
    } = props;

    const classNames = clsx(
        className,
        'row',
        active && 'active',
        borderTop && 'border-top',
        borderBottom && 'border-bottom'
    );

    return (
        <RootComponent
            className={classNames}
            style={style}
            sx={sx}
            onClick={onClick}
        >
            {children}
        </RootComponent >
    );

});

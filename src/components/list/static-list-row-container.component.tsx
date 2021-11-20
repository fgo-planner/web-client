import { MuiStyledOptions, styled } from '@mui/system';
import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';
import { ComponentStyleProps } from '../../types/internal';
import listRowStyle from './list-row-style';

type Props = PropsWithChildren<{
    active?: boolean;
    borderTop?: boolean;
    borderBottom?: boolean;
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
        >
            {children}
        </RootComponent >
    );

});

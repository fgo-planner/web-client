import { styled } from '@mui/system';
import clsx from 'clsx';
import React, { DOMAttributes, PropsWithChildren, ReactNode } from 'react';
import { ComponentStyleProps } from '../../types/internal';
import BaseListRowStyle from './data-table-list-row-style';

// TODO Add prop for cursor style.
type Props = PropsWithChildren<{
    active?: boolean;
    borderTop?: boolean;
    borderBottom?: boolean;
    stickyContent?: ReactNode;
}> & ComponentStyleProps & DOMAttributes<HTMLDivElement>;

const RootComponent = styled('div')(BaseListRowStyle);

export const StaticListRowContainer = React.memo((props: Props) => {

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
            {...domAttributes}
        >
            {stickyContent && <div className='sticky-content'>
                {stickyContent}
            </div>}
            {children}
        </RootComponent >
    );

});

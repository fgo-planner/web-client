import { FilteringStyledOptions } from '@mui/styled-engine';
import { styled } from '@mui/system';
import clsx from 'clsx';
import React, { DOMAttributes, PropsWithChildren, ReactNode } from 'react';
import { ComponentStyleProps, StyledFunctionProps } from '../../types';
import { DataTableListRowStyle } from './DataTableListRowStyle';

// TODO Add prop for cursor style.
type Props = PropsWithChildren<{
    active?: boolean;
    borderTop?: boolean;
    borderBottom?: boolean;
    disablePointerEvents?: boolean;
    id?: string;
    noStyling?: boolean
    stickyContent?: ReactNode;
    styleClassPrefix?: string;
}> & Pick<ComponentStyleProps, 'className' | 'style'> & DOMAttributes<HTMLDivElement>;

export const StyleClassPrefix = 'DataTableListRow';

const shouldForwardProp = (prop: PropertyKey): prop is keyof StyledFunctionProps => (
    prop !== 'classPrefix' &&
    prop !== 'forRoot'
);

const StyledOptions = {
    skipSx: true,
    skipVariantsResolver: true,
    shouldForwardProp
} as FilteringStyledOptions<StyledFunctionProps>;

const RootComponent = styled('div', StyledOptions)<StyledFunctionProps>(DataTableListRowStyle);

export const DataTableListRow = React.memo((props: Props) => {

    const {
        children,
        active,
        borderTop,
        borderBottom,
        disablePointerEvents,
        id,
        noStyling,
        stickyContent,
        styleClassPrefix = StyleClassPrefix,
        className,
        style,
        ...domAttributes
    } = props;

    const stickyContentNode: ReactNode = stickyContent && (
        <div className={`${styleClassPrefix}-sticky-content`}>
            {stickyContent}
        </div>
    );

    const classNames = clsx(
        className,
        `${styleClassPrefix}-root`,
        active && `${styleClassPrefix}-active`,
        borderTop && `${styleClassPrefix}-border-top`,
        borderBottom && `${styleClassPrefix}-border-bottom`,
        disablePointerEvents && `${styleClassPrefix}-no-pointer-events`
    );

    if (noStyling) {
        return (
            <div
                id={id}
                className={classNames}
                style={style}
                {...domAttributes}
            >
                {stickyContentNode}
                {children}
            </div>
        );
    }

    return (
        <RootComponent
            id={id}
            className={classNames}
            classPrefix={styleClassPrefix}
            forRoot
            style={style}
            {...domAttributes}
        >
            {stickyContentNode}
            {children}
        </RootComponent>
    );

});

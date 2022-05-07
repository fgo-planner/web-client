import React, { CSSProperties, PropsWithChildren, UIEventHandler } from 'react';
import { ComponentStyleProps } from '../../types/internal';

type Props = PropsWithChildren<{
    scrollContainerRef?: React.LegacyRef<HTMLDivElement>,
    /**
     * For use with class components.
     * @deprecated Use function components whenever possible.
     */
    onScrollHandler?: UIEventHandler<HTMLDivElement>
}> & Pick<ComponentStyleProps, 'className'>;

// This component does not need StyleClassPrefix.

const StyleProps = {
    overflow: 'auto',
    height: '100%'
} as CSSProperties;

export const LayoutPageScrollable = React.memo((props: Props) => {

    const {
        onScrollHandler,
        scrollContainerRef,
        children,
        className
    } = props;

    return (
        <div
            style={StyleProps}
            className={className}
            ref={scrollContainerRef}
            onScroll={onScrollHandler}
        >
            {children}
        </div>
    );

});

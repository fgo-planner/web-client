import React, { PropsWithChildren, UIEventHandler } from 'react';

type Props = PropsWithChildren<{
    scrollContainerRef?: React.LegacyRef<HTMLDivElement>,

    /**
     * For use with class components.
     * @deprecated Use function components whenever possible.
     */
    onScrollHandler?: UIEventHandler<HTMLDivElement>
}>;

const Style: React.CSSProperties = {
    overflow: 'auto',
    height: '100%'
};

export const LayoutPageScrollable = React.memo(({ children, scrollContainerRef, onScrollHandler }: Props) => (
    <div style={Style} ref={scrollContainerRef} onScroll={onScrollHandler}>
        {children}
    </div>
));

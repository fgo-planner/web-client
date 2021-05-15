import React, { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
    scrollContainerRef?: React.LegacyRef<HTMLDivElement>
}>;

const Style: React.CSSProperties = {
    overflow: 'auto',
    height: '100%'
};

export const LayoutPageScrollable = React.memo(({ children, scrollContainerRef }: Props) => (
    <div style={Style} ref={scrollContainerRef}>
        {children}
    </div>
));

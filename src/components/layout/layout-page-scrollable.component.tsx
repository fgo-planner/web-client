import React, { CSSProperties, PropsWithChildren, UIEventHandler } from 'react';

type Props = PropsWithChildren<{
    scrollContainerRef?: React.LegacyRef<HTMLDivElement>,
    /**
     * For use with class components.
     * @deprecated Use function components whenever possible.
     */
    onScrollHandler?: UIEventHandler<HTMLDivElement>
}>;

// This component does not need StyleClassPrefix.

const StyleProps = {
    overflow: 'auto',
    height: '100%'
} as CSSProperties;

export const LayoutPageScrollable = React.memo((props: Props) => {

    const {
        children,
        scrollContainerRef,
        onScrollHandler
    } = props;

    return (
        <div
            style={StyleProps}
            ref={scrollContainerRef}
            onScroll={onScrollHandler}
        >
            {children}
        </div>
    );

});

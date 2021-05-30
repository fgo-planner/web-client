import React, { CSSProperties, PropsWithChildren, useMemo } from 'react';
import { ComponentStyleProps } from '../../types';

type Props = PropsWithChildren<{
    width?: string | number;
    flex?: string | number;
    size?: 'medium' | 'small';
}> & ComponentStyleProps;

const HeightSmall = 72;

const HeightMedium = 96;

export const InputFieldContainer = React.memo((props: Props) => {

    const {
        children,
        className,
        width,
        flex,
        size
    } = props;

    const style: CSSProperties = useMemo(() => ({
        width,
        flex,
        height: size === 'small' ? HeightSmall : HeightMedium,
        boxSizing: 'border-box'
    }), [width, flex, size]);

    return (
        <div className={className} style={style}>
            {children}
        </div>
    );
    
});

import { Box } from '@mui/system';
import React, { CSSProperties, PropsWithChildren, useMemo } from 'react';
import { ComponentStyleProps } from '../../types/internal';

type Props = PropsWithChildren<{
    width?: string | number;
    flex?: string | number;
    size?: 'medium' | 'small';
}> & Pick<ComponentStyleProps, 'style' | 'sx' | 'className'>;

const HeightSmall = 72;

const HeightMedium = 96;

export const InputFieldContainer = React.memo((props: Props) => {

    const {
        children,
        width,
        flex,
        size,
        sx
    } = props;

    const style: CSSProperties = useMemo(() => ({
        width,
        flex,
        height: size === 'small' ? HeightSmall : HeightMedium,
        boxSizing: 'border-box',
        ...props.style
    }), [flex, props.style, size, width]);

    if (sx) {
        return (
            <Box style={style} sx={sx}>
                {children}
            </Box>
        );
    }

    return (
        <div style={style}>
            {children}
        </div>
    );

});

import { Box } from '@mui/system';
import clsx from 'clsx';
import React, { CSSProperties, PropsWithChildren, useMemo } from 'react';
import { ComponentStyleProps } from '../../types';

type Props = PropsWithChildren<{
    width?: string | number;
    flex?: string | number;
    size?: 'medium' | 'small';
}> & Pick<ComponentStyleProps, 'className' | 'sx'>;

const HeightSmall = 72;

const HeightMedium = 96;

export const StyleClassPrefix = 'InputFieldContainer';

export const InputFieldContainer = React.memo((props: Props) => {

    const {
        children,
        width,
        flex,
        size,
        className,
        sx
    } = props;

    const style: CSSProperties = useMemo(() => ({
        width,
        flex,
        height: size === 'small' ? HeightSmall : HeightMedium,
        boxSizing: 'border-box',
    }), [flex, size, width]);

    return (
        <Box className={clsx(`${StyleClassPrefix}-root`, className)} style={style} sx={sx}>
            {children}
        </Box>
    );

});

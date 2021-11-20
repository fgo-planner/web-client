import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { CSSProperties, PropsWithChildren, useMemo } from 'react';

type Props = PropsWithChildren<{
    width?: number | string;
}>;

const DefaultWidth = 56;

const StyleProps = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    pt: 2,
    '& >*': {
        // https://material.io/components/navigation-rail#specs
        py: 1
    }
} as SystemStyleObject<Theme>;

export const NavigationRail = React.memo(({ children, width }: Props) => {

    const widthStyle = useMemo((): CSSProperties => ({
        width: width || DefaultWidth
    }), [width]);

    return (
        <Box sx={StyleProps} style={widthStyle}>
            {children}
        </Box>
    );

});

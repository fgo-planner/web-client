import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { CSSProperties, PropsWithChildren, useMemo } from 'react';
import { Theme } from '@mui/material';
import clsx from 'clsx';

type Props = PropsWithChildren<{
    borderRight?: boolean;
    width?: number | string;
}>;

const DefaultWidth = 56;

const StyleProps = (theme: SystemTheme) => {

    const { palette } = theme as Theme;

    return {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        pt: 2,
        '& >*': {
            // https://material.io/components/navigation-rail#specs
            py: 1
        },
        '& >.MuiDivider-root': {
            width: '50%',
            py: 0,
            my: 4
        },
        '&.border-right': {
            borderRightWidth: 1,
            borderRightStyle: 'solid',
            borderRightColor: palette.divider,
        }
    } as SystemStyleObject<SystemTheme>;
};

export const NavigationRail = React.memo(({ children, borderRight, width }: Props) => {

    const widthStyle = useMemo((): CSSProperties => ({
        width: width || DefaultWidth
    }), [width]);

    return (
        <Box
            className={clsx(borderRight && 'border-right')}
            style={widthStyle}
            sx={StyleProps}
        >
            {children}
        </Box>
    );

});

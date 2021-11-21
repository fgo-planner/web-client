import { alpha, Box, SystemStyleObject, Theme } from '@mui/system';
import React, { PropsWithChildren } from 'react';
import { ThemeConstants } from '../../../styles/theme-constants';
import { StyleClassPrefix as AppBarLinkStyleClassPrefix } from './app-bar-link.component';

type Props = PropsWithChildren<{}>;

const StyleClassPrefix = 'AppBarLinks';

const StyleProps = (theme: Theme) => ({
    display: 'flex',
    height: theme.spacing(ThemeConstants.AppBarHeightScale),
    mx: 2,
    my: 0,
    [`& .${AppBarLinkStyleClassPrefix}-root`]: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        color: 'primary.main',
        textDecoration: 'none',
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontWeight: 500,
        boxSizing: 'border-box',
        mx: 2,
        my: 0,
        px: 2,
        py: 0,
        borderBottomWidth: 4,
        borderBottomStyle: 'solid',
        borderBottomColor: 'transparent',
        transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        ':hover': {
            background: alpha(theme.palette.primary.main, 0.04)
        },
        '&.active': {
            borderBottomColor: 'primary.main'
        }
    }
} as SystemStyleObject<Theme>);

export const AppBarLinks = React.memo(({ children }: Props) => (
    <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
        {children}
    </Box>
));

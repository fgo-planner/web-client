import { Box, SystemStyleObject, Theme } from '@mui/system';
import React from 'react';
import { ThemeConstants } from '../../styles/theme-constants';
import { AppBar } from './app-bar/app-bar.component';
import { LoadingIndicatorOverlay } from './loading-indicator-overlay';

const StyleClassPrefix = 'NavigationMain';

const StyleProps = (theme: Theme) => ({
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    top: 0,
    left: 0,
    right: 0,
    height: '100vh',
    [`& .${StyleClassPrefix}-upper-section`]: {
        zIndex: 2
    },
    [`& .${StyleClassPrefix}-lower-section`]: {
        // display: 'flex',
        height: `calc(100vh - ${theme.spacing(ThemeConstants.AppBarHeightScale)})`,
        flex: 1,
        overflow: 'hidden',
        bgcolor: 'background.default',
        color: 'text.primary'
    } 
} as SystemStyleObject<Theme>);

export const NavigationMain = React.memo(({ children }) => (
    <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
        {/* <ThemeBackground /> */}
        <div className={`${StyleClassPrefix}-upper-section`}>
            <AppBar />
        </div>
        <div className={`${StyleClassPrefix}-lower-section`}>
            {children}
        </div>
        <LoadingIndicatorOverlay />
    </Box>
));

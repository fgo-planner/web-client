import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { PropsWithChildren } from 'react';
import { useActiveBreakpoints } from '../../hooks/user-interface/use-active-breakpoints.hook';
import { ThemeConstants } from '../../styles/theme-constants';
import { LoadingIndicatorOverlay } from '../utils/loading-indicator-overlay.component';
import { AppBar } from './app-bar/app-bar.component';
import { NavigationDrawerContainer } from './navigation-drawer/navigation-drawer-container.component';

const StyleClassPrefix = 'NavigationLayout';

const StyleProps = (theme: Theme) => ({
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    [`& .${StyleClassPrefix}-upper-section`]: {
        zIndex: 2
    },
    [`& .${StyleClassPrefix}-lower-section`]: {
        // display: 'flex',
        height: `calc(100% - ${theme.spacing(ThemeConstants.AppBarHeightScale)})`,
        flex: 1,
        overflow: 'hidden',
        bgcolor: 'background.default',
        color: 'text.primary'
    }
} as SystemStyleObject<Theme>);

export const NavigationLayout = React.memo(({ children }: PropsWithChildren<{}>) => {

    const { xl } = useActiveBreakpoints();

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <NavigationDrawerContainer mobileView={!xl}>
                <div className={`${StyleClassPrefix}-upper-section`}>
                    <AppBar />
                </div>
                <div className={`${StyleClassPrefix}-lower-section`}>
                    {children}
                </div>
            </NavigationDrawerContainer>
            <LoadingIndicatorOverlay />
        </Box>
    );

});

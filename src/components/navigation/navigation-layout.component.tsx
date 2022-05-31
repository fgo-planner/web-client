import { Theme } from '@mui/material';
import { Box, SystemStyleObject } from '@mui/system';
import React, { PropsWithChildren } from 'react';
import { useActiveBreakpoints } from '../../hooks/user-interface/use-active-breakpoints.hook';
import { SxPropsFunction } from '../../types/internal';
import { LoadingIndicatorOverlay } from '../utils/loading-indicator-overlay.component';
import { AppBar } from './app-bar/app-bar.component';
import { NavigationDrawerContainer } from './navigation-drawer/navigation-drawer-container.component';

const StyleClassPrefix = 'NavigationLayout';

const StyleProps = (({ breakpoints, spacing }: Theme) => ({
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
        flex: 1,
        overflow: 'hidden',
        bgcolor: 'background.default',
        color: 'text.primary'
    }
} as SystemStyleObject)) as SxPropsFunction;

export const NavigationLayout = React.memo(({ children }: PropsWithChildren<{}>) => {

    const { lg, xl } = useActiveBreakpoints();

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <NavigationDrawerContainer mobileView={!lg && !xl}>
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

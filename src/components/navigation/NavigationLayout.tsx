import { Box, SystemStyleObject } from '@mui/system';
import React, { PropsWithChildren } from 'react';
import { useActiveBreakpoints } from '../../hooks/user-interface/useActiveBreakpoints';
import { LoadingIndicatorOverlay } from '../utils/LoadingIndicatorOverlay';
import { AppBar } from './app-bar/AppBar';
import { GlobalDialogsContainer } from './GlobalDialogsContainer';
import { NavigationDrawerContainer } from './navigation-drawer/NavigationDrawerContainer';

const StyleClassPrefix = 'NavigationLayout';

const StyleProps = {
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
} as SystemStyleObject;

export const NavigationLayout = React.memo(({ children }: PropsWithChildren<{}>) => {

    const { lg, xl } = useActiveBreakpoints();

    return <>
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <NavigationDrawerContainer mobileView={!lg && !xl}>
                <div className={`${StyleClassPrefix}-upper-section`}>
                    <AppBar />
                </div>
                <div className={`${StyleClassPrefix}-lower-section`}>
                    {children}
                </div>
            </NavigationDrawerContainer>
        </Box>
        <GlobalDialogsContainer />
        <LoadingIndicatorOverlay />
    </>;

});

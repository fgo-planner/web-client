import React, { Suspense, useEffect, useMemo } from 'react';
import { RouteObject, useRoutes } from 'react-router-dom';
import { UAParser } from 'ua-parser-js';
import { NavigationLayout } from './components/navigation/navigation-layout.component';
import { LazyLoadFallback } from './components/route-fallback/lazy-load-fallback.component';
import { ThemeProviderWrapper } from './components/theme/theme-provider-wrapper.component';
import { RequireAuthentication } from './components/utils/require-authentication.component';
import { DeviceInfoContext } from './contexts/device-info.context';
import { useInjectable } from './hooks/dependency-injection/use-injectable.hook';
import { useNavigationDrawerNoAnimations } from './hooks/user-interface/use-navigation-drawer-no-animations.hook';
import { AboutRoute } from './routes/about.route';
import { ErrorRoute } from './routes/error.route';
import { ForgotPasswordRoute } from './routes/forgot-password.route';
import { HomeRoute } from './routes/home/home.route';
import { LoginRoute } from './routes/login.route';
import { RegistrationRoute } from './routes/registration.route';
import { BackgroundMusicService } from './services/audio/background-music.service';
import { DeviceInfo, DeviceType } from './types';

console.info('RootModule loaded');

/*================= Navigation Outline =================

→ Root (module)
    ↳ Home
    ↳ Login, Create Account, Recover Password, etc.
    ↳ Error Pages
    ↳ Resources (module, lazy-loaded)
        ↳ Servants
        ↳ Items
        ↳ Events
    ↳ Authenticated (module, lazy-loaded)
        ↳ User Account
            ↳ User Settings
            ↳ Master Accounts
        ↳ Master Account
            ↳ Settings
            ↳ Dashboard
            ↳ Planner/Plans
                ↳ Plan
            ↳ Servant Roster
                ↳ Stats
            ↳ Inventory
                ↳ Stats
            ↳ Costumes
            ↳ Soundtracks
            ↳ Data Import/Export (lazy-loaded)
        ↳ Friends (TODO)
            ↳ Items
            ↳ Servants
            ↳ Planner
    ↳ Shared (TODO, module, lazy-loaded, hidden)
        ↳ Items
        ↳ Servants
        ↳ Planner

======================================================*/

const ResourcesModule = React.lazy(() => import('./modules/resources/resources.module'));

const AuthenticatedModule = React.lazy(() => import('./modules/authenticated/authenticated.module'));

const RootModuleRoutes = [
    {
        path: '/',
        element: <HomeRoute />
    },
    {
        path: '/about',
        element: <AboutRoute />
    },
    {
        path: '/login',
        element: <LoginRoute />
    },
    {
        path: '/register',
        element: <RegistrationRoute />
    },
    {
        path: '/forgot-password',
        element: <ForgotPasswordRoute />
    },
    {
        path: '/resources/*',
        element: (
            <Suspense fallback={<LazyLoadFallback />}>
                <ResourcesModule />
            </Suspense>
        )
    },
    {
        path: '/user/*',
        element: (
            <RequireAuthentication>
                <Suspense fallback={<LazyLoadFallback />}>
                    <AuthenticatedModule />
                </Suspense>
            </RequireAuthentication>
        )
    },
    {
        element: <ErrorRoute />
    }
] as Array<RouteObject>;

export const RootModule = React.memo(() => {

    /**
     * Disables drawer animations for the entire app.
     *
     * TODO This is temporary... either selectively disable animation for routes, or
     * make it configurable via environment variable or user setting, or permanently
     * remove the animations altogether.
     */
    useNavigationDrawerNoAnimations();

    const backgroundMusicService = useInjectable(BackgroundMusicService);

    useEffect(() => {
        const autoplayMusic = process.env.REACT_APP_AUTOPLAY_MUSIC;
        if (autoplayMusic && autoplayMusic.toLowerCase() === 'true') {
            // Autoplay background music
            backgroundMusicService.play();
        }
    }, [backgroundMusicService]);

    const activeRouteElement = useRoutes(RootModuleRoutes);

    /**
     * Device info as parsed from the user agent string.
     */
    const deviceInfo = useMemo((): DeviceInfo => {
        const uaParser = new UAParser();
        const rawDeviceType = uaParser.getDevice().type;
        /*
         * Convert the raw device type from `UAParser` into a simplified categorization
         * consisting of phone, tablet, and desktop.
         */
        let deviceType: DeviceType;
        switch (rawDeviceType) {
            case 'wearable':
                /*
                 * Wearable devices are not actually supported, but we will just categorize it
                 * as a phone for now.
                 *
                 * eslint-disable-next-line no-fallthrough
                 */
            case 'mobile':
                deviceType = DeviceType.Phone;
                break;
            case 'tablet':
                deviceType = DeviceType.Tablet;
                break;
            default:
                /*
                 * Any other values (console, smarttv, embedded) will be categorized as a
                 * desktop browser. In addition, `UAParser` will return `undefined` type for
                 * actual desktop browsers.
                 */
                deviceType = DeviceType.Desktop;
        }

        return {
            deviceType,
            isMobile: deviceType < DeviceType.Desktop
        };

    }, []);

    console.log('Device info', deviceInfo);

    return (
        <DeviceInfoContext.Provider value={deviceInfo}>
            <ThemeProviderWrapper>
                <NavigationLayout>
                    {activeRouteElement}
                </NavigationLayout>
            </ThemeProviderWrapper>
        </DeviceInfoContext.Provider>
    );

});

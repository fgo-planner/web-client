import React, { Suspense, useEffect } from 'react';
import { RouteObject, useRoutes } from 'react-router-dom';
import { NavigationMain } from './components/navigation/navigation-main.component';
import { LazyLoadFallback } from './components/route-fallback/lazy-load-fallback.component';
import { ThemeProviderWrapper } from './components/theme/theme-provider-wrapper.component';
import { RequireAuthentication } from './components/utils/require-authentication.component';
import { useInjectable } from './hooks/dependency-injection/use-injectable.hook';
import { AboutRoute } from './routes/about.route';
import { ErrorRoute } from './routes/error.route';
import { ForgotPasswordRoute } from './routes/forgot-password.route';
import { HomeRoute } from './routes/home/home.route';
import { LoginRoute } from './routes/login.route';
import { RegistrationRoute } from './routes/registration.route';
import { BackgroundMusicService } from './services/audio/background-music.service';

console.log('RootModule loaded');

/*
Planned navigation outline:

→ Root
    ↳ Home
    ↳ Login, Create Account, Recover Password, etc.
    ↳ Error Pages
    ↳ Resources (module)
        ↳ Servants
        ↳ Items
        ↳ Events
    ↳ Authenticated (module)
        ↳ User Profile
        ↳ Master Accounts
            ↳ Profile
            ↳ Items
            ↳ Servants
            ↳ Planner
            ↳ Data Import/Export (lazy loaded)
        ↳ Friends
            ↳ Items
            ↳ Servants
            ↳ Planner
    ↳ Shared (module, hidden)
        ↳ Items
        ↳ Servants
        ↳ Planner
*/

const ResourcesModule = React.lazy(() => import('./modules/resources/resources.module'));

const AuthenticatedModule = React.lazy(() => import('./modules/authenticated/authenticated.module'));

const ModuleRoutes = [
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

    const backgroundMusicService = useInjectable(BackgroundMusicService);

    useEffect(() => {
        const autoplayMusic = process.env.REACT_APP_AUTOPLAY_MUSIC;
        if (autoplayMusic && autoplayMusic.toLowerCase() === 'true') {
            // Autoplay background music
            backgroundMusicService.play();
        }
    }, [backgroundMusicService]);

    const activeRouteElement = useRoutes(ModuleRoutes);

    return (
        <ThemeProviderWrapper>
            <NavigationMain>
                {activeRouteElement}
            </NavigationMain>
        </ThemeProviderWrapper>
    );

});

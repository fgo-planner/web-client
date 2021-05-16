import React, { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ModuleComponent } from './components/base/module-component';
import { NavigationMain } from './components/navigation/navigation-main.component';
import { ThemeManager } from './components/theme/theme-manager.component';
import { ErrorRoute } from './routes/error.route';
import { ForgotPasswordRoute } from './routes/forgot-password.route';
import { HomeRoute } from './routes/home.route';
import { LoginRoute } from './routes/login.route';
import { RegistrationRoute } from './routes/registration.route';
import { BackgroundMusicService } from './services/user-interface/background-music.service';
import { RouteDefinitions } from './types';

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

export class RootModule extends ModuleComponent {

    protected readonly ModuleRoutes: RouteDefinitions = [
        {
            path: '/',
            exact: true,
            component: HomeRoute
        },
        {
            path: '/login',
            exact: true,
            component: LoginRoute
        },
        {
            path: '/register',
            exact: true,
            component: RegistrationRoute
        },
        {
            path: '/forgot-password',
            exact: true,
            component: ForgotPasswordRoute
        },
        {
            path: '/resources',
            lazyComponent: React.lazy(() => import('./modules/resources/resources.module'))
        },
        {
            path: '/user',
            lazyComponent: React.lazy(() => import('./modules/authenticated/authenticated.module')),
            authenticationRequired: true
        },
        {
            component: ErrorRoute
        }
    ];

    componentDidMount() {
        const autoplayMusic = process.env.REACT_APP_AUTOPLAY_MUSIC;
        if (autoplayMusic && autoplayMusic.toLowerCase() === 'true') {
            // Autoplay background music
            BackgroundMusicService.play();
        }
    }

    render(): ReactNode {
        return (
            <BrowserRouter>
                <ThemeManager>
                    <NavigationMain>
                        {this._renderModuleRoutes()}
                    </NavigationMain>
                </ThemeManager>
            </BrowserRouter>
        );
    }

}

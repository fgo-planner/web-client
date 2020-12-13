import { ModuleComponent, RouteDefinitions } from 'internal';
import React, { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { NavigationMain } from './components/navigation/navigation-main.component';
import { ThemeManager } from './components/theme/theme-manager.component';
import { ErrorRoute } from './routes/error.route';
import { HomeRoute } from './routes/home.route';

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
        ↳ Game Accounts
            ↳ Profile
            ↳ Items
            ↳ Servants
            ↳ Planner
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
            path: '/resources',
            lazyComponent: React.lazy(() => import('../resources/resources.module'))
        },
        {
            path: '/user',
            lazyComponent: React.lazy(() => import('../authenticated/authenticated.module'))
        },
        {
            component: ErrorRoute
        }
    ];

    render(): ReactNode {
        return (
            <BrowserRouter>
                <ThemeManager>
                    <NavigationMain>
                        {this.renderModuleRoutes()}
                    </NavigationMain>
                </ThemeManager>
            </BrowserRouter>
        );
    }

}

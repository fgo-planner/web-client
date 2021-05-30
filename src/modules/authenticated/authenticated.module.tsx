import React from 'react';
import { ModuleComponent } from '../../components/base/module-component';
import { RouteDefinitions } from '../../types';
import { MasterAccountHomeRoute } from './routes/master-account-home.route';
import { MasterAccountsRoute } from './routes/master-accounts/master-accounts.route';
import { MasterItemStatsRoute } from './routes/master-item-stats/master-item-stats.route';
import { MasterItemsRoute } from './routes/master-items.route';
import { MasterPlansRoute } from './routes/master-plans/master-plans.route';
import { MasterServantStatsRoute } from './routes/master-servant-stats/master-servant-stats.route';
import { MasterServantsRoute } from './routes/master-servants/master-servants.route';
import { UserSettingsRoute } from './routes/user-settings.route';

export default class AuthenticatedModule extends ModuleComponent {

    protected readonly ModuleRoutes: RouteDefinitions = [
        {
            path: '/',
            exact: true,
            redirectTo: '/master'
        },
        {
            path: '/settings',
            exact: true,
            component: UserSettingsRoute
        },
        {
            path: '/master-accounts',
            exact: true,
            component: MasterAccountsRoute
        },
        {
            path: '/master',
            exact: true,
            component: MasterAccountHomeRoute
        },
        {
            path: '/master/servants',
            exact: true,
            component: MasterServantsRoute
        },
        {
            path: '/master/servants/stats',
            exact: true,
            component: MasterServantStatsRoute
        },
        {
            path: '/master/items',
            exact: true,
            component: MasterItemsRoute
        },
        {
            path: '/master/items/stats',
            exact: true,
            component: MasterItemStatsRoute
        },
        {
            path: '/master/planner',
            exact: true,
            component: MasterPlansRoute
        },
        {
            path: '/master/data/import/servants',
            exact: true,
            lazyComponent: React.lazy(() => import('./routes/master-servant-import.route')),
        }
    ];

}

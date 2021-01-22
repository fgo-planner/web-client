import { ModuleComponent, RouteDefinitions } from 'internal';
import { MasterAccountHomeRoute } from './routes/master-account-home.route';
import { MasterItemsRoute } from './routes/master-items.route';
import { MasterServantsRoute } from './routes/master-servants.route';

export default class AuthenticatedModule extends ModuleComponent {

    protected readonly ModuleRoutes: RouteDefinitions = [
        {
            path: '/',
            exact: true,
            redirectTo: '/account'
        },
        {
            path: '/account',
            exact: true,
            component: MasterAccountHomeRoute,
        },
        {
            path: '/account/servants',
            exact: true,
            component: MasterServantsRoute
        },
        {
            path: '/account/items',
            exact: true,
            component: MasterItemsRoute
        }
    ];

}

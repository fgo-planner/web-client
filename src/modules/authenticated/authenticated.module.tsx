import { ModuleComponent, RouteDefinitions } from 'internal';
import { MasterAccountHomeRoute } from './routes/master-account-home.route';
import { MasterItemsRoute } from './routes/master-items.route';
import { MasterServantsRoute } from './routes/master-servants.route';

export default class AuthenticatedModule extends ModuleComponent {

    protected readonly ModuleRoutes: RouteDefinitions = [
        {
            path: '/',
            exact: true,
            redirectTo: '/master'
        },
        {
            path: '/master',
            exact: true,
            component: MasterAccountHomeRoute,
        },
        {
            path: '/master/servants',
            exact: true,
            component: MasterServantsRoute
        },
        {
            path: '/master/items',
            exact: true,
            component: MasterItemsRoute
        }
    ];

}

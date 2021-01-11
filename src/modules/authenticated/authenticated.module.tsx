import { ModuleComponent, RouteDefinitions } from 'internal';
import { GameAccountHomeRoute } from './routes/game-account-home.route';
import { GameAccountItemsRoute } from './routes/game-account-items.route';
import { GameAccountServantsRoute } from './routes/game-account-servants.route';

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
            component: GameAccountHomeRoute,
        },
        {
            path: '/account/servants',
            exact: true,
            component: GameAccountServantsRoute
        },
        {
            path: '/account/items',
            exact: true,
            component: GameAccountItemsRoute
        }
    ];

}

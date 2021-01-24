import { ModuleComponent, RouteDefinitions } from 'internal';
import { GameServantsRoute } from './routes/game-servants.route';
import { GameEventsRoute } from './routes/game-events.route';
import { GameItemsRoute } from './routes/game-items.route';
import { ReactNode } from 'react';

export default class ResourcesModule extends ModuleComponent {

    protected readonly RedirectOnRouteMismatch = true;

    protected readonly ModuleRoutes: RouteDefinitions = [
        {
            path: '/',
            exact: true,
            redirectTo: '/servants'
        },
        {
            path: '/servants',
            exact: true,
            component: GameServantsRoute
        },
        {
            path: '/items',
            exact: true,
            component: GameItemsRoute
        },
        {
            path: '/events',
            exact: true,
            component: GameEventsRoute
        },
        // {
        //     path: '/:id',
        //     exact: true,
        //     component: EventsRoute
        // },
    ];

    render(): ReactNode {
        console.log("RESOURCES RENDERED")
        return super.render();
    }

}

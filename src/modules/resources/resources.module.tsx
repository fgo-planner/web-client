import { ReactNode } from 'react';
import { ModuleComponent } from '../../components/base/module-component';
import { RouteDefinitions } from '../../types';
import { GameEventsRoute } from './routes/game-events.route';
import { GameItemRoute } from './routes/game-item-route';
import { GameItemsRoute } from './routes/game-items.route';
import { GameServantRoute } from './routes/game-servant.route';
import { GameServantsRoute } from './routes/game-servants.route';

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
            path: '/servants/:id',
            exact: true,
            component: GameServantRoute
        },
        {
            path: '/items',
            exact: true,
            component: GameItemsRoute
        },
        {
            path: '/items/:id',
            exact: true,
            component: GameItemRoute
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

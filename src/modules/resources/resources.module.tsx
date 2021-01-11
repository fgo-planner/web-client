import { ModuleComponent, RouteDefinitions } from 'internal';
import { ServantsRoute } from './routes/servants.route';
import { EventsRoute } from './routes/events.route';
import { ReactNode } from 'react';
import { ResourcesRoute } from './routes/resources.route';

export default class ResourcesModule extends ModuleComponent {

    protected readonly RedirectOnRouteMismatch = true;

    protected readonly ModuleRoutes: RouteDefinitions = [
        {
            path: '/',
            exact: true,
            component: ResourcesRoute
        },
        {
            path: '/servants',
            exact: true,
            component: ServantsRoute
        },
        {
            path: '/events',
            exact: true,
            component: EventsRoute
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

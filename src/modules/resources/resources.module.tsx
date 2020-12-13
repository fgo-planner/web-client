import { ModuleComponent, RouteDefinitions } from 'internal';
import { Servants } from './routes/servants.route';
import { Events } from './routes/events.route';
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
            component: Servants
        },
        {
            path: '/events',
            exact: true,
            component: Events
        },
        // {
        //     path: '/:id',
        //     exact: true,
        //     component: Events
        // },
    ];

    render(): ReactNode {
        console.log("RESOURCES RENDERED")
        return super.render();
    }

}

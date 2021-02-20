import { ReactNode } from 'react';
import { LazyRouteComponent } from './lazy-route-component.type';
import { RouteComponent } from './route-component.type';

export type RouteDefinition = {
    
    readonly path?: string;

    readonly redirectTo?: string;

    readonly redirectToAbsolute?: boolean;

    readonly key?: string | number;

    readonly exact?: boolean;

    readonly strict?: boolean;

    readonly component?: RouteComponent;

    readonly lazyComponent?: LazyRouteComponent;

    readonly lazyFallback?: ReactNode;

    readonly authenticationRequired?: boolean;

    readonly children?: RouteDefinitions;

};

export type RouteDefinitions = ReadonlyArray<RouteDefinition>;
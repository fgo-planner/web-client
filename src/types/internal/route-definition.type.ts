import { LazyExoticComponent, ReactNode } from 'react';
import { RouteComponent } from '../../components/base/route-component';

export type RouteDefinition = {
    
    readonly path?: string;

    readonly redirectTo?: string;

    readonly redirectToAbsolute?: boolean;

    readonly key?: string | number;

    readonly exact?: boolean;

    readonly strict?: boolean;

    readonly component?: typeof RouteComponent;

    readonly lazyComponent?: LazyExoticComponent<any>;

    readonly lazyFallback?: ReactNode;

    readonly authenticationRequired?: boolean;

    readonly children?: RouteDefinitions;

};

export type RouteDefinitions = ReadonlyArray<RouteDefinition>;
import React, { ReactNode, Suspense } from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication/auth.service';
import { Nullable, RouteDefinition, RouteDefinitions, UserInfo } from '../../types';
import { LazyLoadFallback } from '../route-fallback/lazy-load-fallback.component';
import { NotFound } from '../route-fallback/not-found.component';
import { RouteComponent } from './route-component';

export abstract class ModuleComponent<P = {}, S = {}> extends RouteComponent<P, S> {

    protected readonly RedirectOnRouteMismatch: boolean = false;

    protected abstract readonly ModuleRoutes: RouteDefinitions;

    private _onCurrentUserChangeSubscription!: Subscription;

    componentDidMount(): void {
        this._onCurrentUserChangeSubscription = AuthenticationService.onCurrentUserChange
            .subscribe(this._handleCurrentUserChange.bind(this));
    }
    
    componentWillUnmount(): void {
        this._onCurrentUserChangeSubscription.unsubscribe();
    }

    render(): ReactNode {
        return this._renderModuleRoutes();
    }

    protected _renderModuleRoutes(): ReactNode {
        return this._renderRoutes(this.ModuleRoutes, this.props.parentPath);
    }

    private _renderRoutes(routes?: RouteDefinitions, parentPath?: string): ReactNode {
        if (!routes || !routes.length) {
            return null;
        }
        return (
            <Switch>
                {routes.map((route, i) => this._renderRoute(route, i, parentPath))}

                {/*
                  * Generate a default empty path route to handle mismatched routes if needed. 
                  */}
                {this._generateDefaultEmptyPathRoute(routes, parentPath)}
            </Switch>
        );
    }

    private _renderRoute(route: RouteDefinition, defaultKey: number, parentPath?: string): ReactNode {
        this._validateRoute(route);

        /*
         * Generate a key to use for the rendered element.
         */
        const key = route.key || defaultKey;

        /*
         * Render an empty route if the path is empty or was not provided.
         */
        if (!route.path) {
            return this._renderEmptyPathRoute(route, key, parentPath);
        }

        /*
         * Generate an absolute path for the route by appending the route's path to the
         * parent path.
         */
        const path = this._getAbsolutePath(parentPath, route.path);

        /*
         * If a redirect path was provided, then render a redirect for the route...
         */
        if (route.redirectTo != null) {
            return this._renderRedirect(route, key, parentPath, path);
        }

        /*
         * ...otherwise, render the route with a normal component.
         */
        return (
            <Route 
                key={key}
                path={path} exact={route.exact}
                strict={route.strict}
                render={props => this._renderRouteComponent(route, props, path)}
            />
        );
    }

    /**
     * Renders a redirected route.
     */
    private _renderRedirect(route: RouteDefinition, key: string | number, parentPath?: string, path?: string): ReactNode {
        /* 
         * route.redirectTo is never null/undefined because null check is performed
         * before this method is called.
         */
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        let redirectTo = route.redirectTo!;

        if (!route.redirectToAbsolute) {
            redirectTo = this._appendPaths(parentPath, redirectTo);
        }
        return (
            <Route key={key} path={path} exact={route.exact} strict={route.strict}>
                <Redirect to={redirectTo} />;
            </Route>
        );
    }

    /**
     * Renders a route or redirect an empty path. An route with an empty path
     * provides a fallback in the case that a matching route could not be found.
     */
    private _renderEmptyPathRoute(route: RouteDefinition, key: string | number, parentPath?: string): ReactNode {
        let redirectTo = route.redirectTo;
        if (redirectTo != null) {
            if (!route.redirectToAbsolute) {
                redirectTo = this._appendPaths(parentPath, redirectTo);
            }
            return <Redirect key={key} to={redirectTo} />;
        }

        return <Route key={key} render={props => this._renderRouteComponent(route, props, parentPath)} />;
    }

    /**
     * Renders the component for a route. If the route requires authentication, but
     * the user is not authenticated, then a redirect to the root URL is rendered
     * instead.
     */
    private _renderRouteComponent(route: RouteDefinition, routeProps: RouteComponentProps, path?: string): ReactNode {
        if (route.authenticationRequired && !AuthenticationService.isLoggedIn) {
            /*
             * Redirect user if they are not authenticated but are trying to access a route
             * that requires authentication.
             * 
             * TODO Define the redirect path as a constant.
             * TODO Redirect to login page?
             */
            return <Redirect to="/"></Redirect>;
        }

        /*
         * Eager-loaded route.
         */
        if (route.component) {
            return (
                <route.component route={route} parentPath={path} {...routeProps}>
                    {this._renderRoutes(route.children, path)}
                </route.component>
            );
        }

        /*
         * Lazy-loaded route. The component node must be wrapped in a Suspense node
         * with a fallback. If a fallback was not provided with the route, then the
         * default LazyLoadFallback component is used.
         */
        if (route.lazyComponent) {
            return (
                <Suspense fallback={route.lazyFallback || <LazyLoadFallback />}>
                    <route.lazyComponent route={route} parentPath={path} {...routeProps}>
                        {this._renderRoutes(route.children, path)}
                    </route.lazyComponent>
                </Suspense>
            );
        }
    }

    /**
     * Check if the provided route definition is valid. Throws error if it is not
     * valid.
     */
    private _validateRoute(route: RouteDefinition): void {
        if (route == null) {
            throw new Error(`Route cannot be ${typeof route}.`);
        }
        if (route.redirectTo == null && !route.component && !route.lazyComponent) {
            throw new Error(`'${route.path}': One of redirectTo, component, or lazyComponent must be provided.`);
        }
    }

    /**
     * If there are no routes with empty paths in the route definitions (excluding
     * children), then this will generate a default empty path route that will be
     * activated as a fallback when no matching routes are found.
     */
    private _generateDefaultEmptyPathRoute(routes: RouteDefinitions, parentPath = '/'): ReactNode {
        /*
         * Check if there are any routes (excluding children) that contain an empty
         * path. If there is, then just return null as an empty path route has already
         * been defined.
         */
        for (const route of routes) {
            if (!route.path) {
                return null;
            }
        }
        /*
         * Otherwise, either redirect to the parent path or use the default NotFound
         * component.
         */
        if (this.RedirectOnRouteMismatch) {
            return <Redirect to={parentPath} />;
        } else {
            return <NotFound />;
        }
    }

    private _getAbsolutePath(parentPath = '', path = ''): string | undefined {
        if (!path || path === '*') {
            return undefined;
        }
        return this._appendPaths(parentPath, path);
    }

    private _appendPaths(parentPath = '', path = ''): string {
        parentPath = parentPath.trim();
        path = path.trim();
        if (parentPath === '/') {
            parentPath = '';
        }
        if (path.startsWith('/')) {
            path = path.substring(1);
        }
        return `${parentPath}/${path}`;
    }
    
    private _handleCurrentUserChange(userInfo: Nullable<UserInfo>): void {
        /* 
         * If user logged out, then re-render. This will trigger a redirect if the user
         * is currently on an authenticated-only route.
         */
        if (!userInfo) {
            this.forceUpdate();
        }
    }

}

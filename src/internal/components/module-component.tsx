import { LazyLoadFallback, NotFound } from 'components';
import { Nullable, RouteDefinition, RouteDefinitions, UserInfo } from 'internal';
import React, { ReactNode, Suspense } from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { Subscription } from 'rxjs';
import { AuthService } from 'services';
import { Container as Injectables } from 'typedi';
import { RouteComponent } from './route-component';

export abstract class ModuleComponent<P = {}, S = {}> extends RouteComponent<P, S> {

    protected readonly RedirectOnRouteMismatch: boolean = false;

    protected abstract readonly ModuleRoutes: RouteDefinitions;

    private _authService = Injectables.get(AuthService);

    private _onCurrentUserChangeSubscription!: Subscription;

    componentDidMount() {
        this._onCurrentUserChangeSubscription = this._authService.onCurrentUserChange
            .subscribe(this._handleCurrentUserChange.bind(this));
    }
    
    componentWillUnmount() {
        this._onCurrentUserChangeSubscription.unsubscribe();
    }

    render(): ReactNode {
        return this.renderModuleRoutes();
    }

    protected renderModuleRoutes(): ReactNode {
        return this.renderRoutes(this.ModuleRoutes, this.props.parentPath);
    }

    private renderRoutes(routes?: RouteDefinitions, parentPath?: string): ReactNode {
        if (!routes || !routes.length) {
            return null;
        }
        return (
            <Switch>
                {routes.map((route, i) => this.renderRoute(route, i, parentPath))}

                {/*
                  * Generate a default empty path route to handle mismatched routes if needed. 
                  */}
                {this.generateDefaultEmptyPathRoute(routes, parentPath)}
            </Switch>
        );
    }

    private renderRoute(route: RouteDefinition, defaultKey: number, parentPath?: string): ReactNode {
        this.validateRoute(route);

        /*
         * Render an empty route if the path is empty or was not provided.
         */
        if (!route.path) {
            return this.renderEmptyPathRoute(route, parentPath);
        }

        /*
         * Generate an absolute path for the route by appending the route's path to the
         * parent path.
         */
        const path = this.getAbsolutePath(parentPath, route.path);

        /*
         * If a redirect path was provided, then render a redirect for the route...
         */
        if (route.redirectTo != null) {
            return this.renderRedirect(route, parentPath, path);
        }

        /*
         * ...otherwise, render the route with a normal component.
         */
        console.log(`Rendered route at path ${path}`, route);
        return (
            <Route path={path} exact={route.exact}
                   strict={route.strict}
                   key={route.key || defaultKey}
                   render={props => this.renderRouteComponent(route, props, path)}>
            </Route>
        );
    }

    /**
     * Renders a redirected route.
     */
    private renderRedirect(route: RouteDefinition, parentPath?: string, path?: string): ReactNode {
        /* 
         * route.redirectTo is never null/undefined because null check is performed
         * before this method is called.
         */
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        let redirectTo = route.redirectTo!;

        if (!route.redirectToAbsolute) {
            redirectTo = this.appendPaths(parentPath, redirectTo);
        }
        return (
            <Route path={path} exact={route.exact} strict={route.strict}>
                <Redirect to={redirectTo} />;
            </Route>
        );
    }

    /**
     * Renders a route or redirect an empty path. An route with an empty path
     * provides a fallback in the case that a matching route could not be found.
     */
    private renderEmptyPathRoute(route: RouteDefinition, parentPath?: string): ReactNode {
        let redirectTo = route.redirectTo;
        if (redirectTo != null) {
            if (!route.redirectToAbsolute) {
                redirectTo = this.appendPaths(parentPath, redirectTo);
            }
            return <Redirect to={redirectTo} />;
        }

        return <Route render={props => this.renderRouteComponent(route, props, parentPath)}></Route>;
    }

    /**
     * Renders the component for a route. If the route requires authentication, but
     * the user is not authenticated, then a redirect to the root URL is rendered
     * instead.
     */
    private renderRouteComponent(route: RouteDefinition, routeProps: RouteComponentProps, path?: string): ReactNode {
        if (route.authenticationRequired && !this._authService.isLoggedIn) {
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
                    {this.renderRoutes(route.children, path)}
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
                        {this.renderRoutes(route.children, path)}
                    </route.lazyComponent>
                </Suspense>
            );
        }
    }

    /**
     * Check if the provided route definition is valid. Throws error if it is not
     * valid.
     */
    private validateRoute(route: RouteDefinition): void {
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
    private generateDefaultEmptyPathRoute(routes: RouteDefinitions, parentPath = '/'): ReactNode {
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

    private getAbsolutePath(parentPath = '', path = '') {
        if (!path || path === '*') {
            return undefined;
        }
        return this.appendPaths(parentPath, path);
    }

    private appendPaths(parentPath = '', path = '') {
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
    
    private _handleCurrentUserChange(userInfo: Nullable<UserInfo>) {
        /* 
         * If user logged out, then re-render. This will trigger a redirect if the user
         * is currently on an authenticated-only route.
         */
        if (!userInfo) {
            this.forceUpdate();
        }
    }

}

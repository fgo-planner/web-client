import { ComponentType } from 'react';
import { RouteComponentProps } from '../props/route-component-props.type';

type LazyRouteComponentProps = React.ComponentPropsWithoutRef<ComponentType<RouteComponentProps>>;

/**
 * Modified version of React's `LazyExoticComponent` type that does not require
 * a `ref` prop. Used for module components.
 */
export type LazyRouteComponent = React.ExoticComponent<LazyRouteComponentProps>;

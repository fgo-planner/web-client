import { RouteDefinition } from 'internal';
import { PureComponent } from 'react';
import { RouteComponentProps as ReactRouteComponentProps } from 'react-router-dom';

export type RouteComponentProps = {
    route?: RouteDefinition;
    parentPath?: string;
} & Partial<ReactRouteComponentProps>;

export abstract class RouteComponent<P = {}, S = {}> extends PureComponent<P & RouteComponentProps, S> {

}

import { RouteDefinition } from 'internal';
import { PureComponent } from 'react';
import { RouteComponentProps } from 'react-router-dom';

type Props = {
    route?: RouteDefinition;
    parentPath: string;
} & Partial<RouteComponentProps>;

type State = {

};

export abstract class RouteComponent<P = {}, S = {}> extends PureComponent<P & Props, S & State> {

}

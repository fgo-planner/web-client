import { PureComponent } from 'react';
import { RouteComponentProps } from '../../types';

export abstract class RouteComponent<P = {}, S = {}> extends PureComponent<P & RouteComponentProps, S> {

}

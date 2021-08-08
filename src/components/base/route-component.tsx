import { PureComponent } from 'react';
import { RouteComponentProps } from '../../types/internal';

/**
 * @deprecated Replaced by function components that take `RouteComponentProps`
 * as a prop.
 */
export abstract class RouteComponent<P = {}, S = {}> extends PureComponent<P & RouteComponentProps, S> {

}

import { PureComponent } from 'react';

export abstract class ModalComponent<P = {}, S = {}> extends PureComponent<P, S> {

    protected _isMounted = true;

    componentWillUnmount() {
        this._isMounted = false;
    }

}

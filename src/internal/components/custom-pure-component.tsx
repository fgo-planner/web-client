import { Component } from 'react';

export abstract class CustomPureComponent<P = {}, S = {}> extends Component<P, S> {

    protected _isMounted = true;

    shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>): boolean {
        return !this._shallowEquals(this.props, nextProps) || !this._shallowEquals(this.state, nextState);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    // TODO Refine this
    private _shallowEquals(a: any, b: any): boolean {
        if (a === b) {
            return true;
        }
        for(const key in a) {
            if (a[key] !== b[key]) {
                return false;
            }
        }
        for(const key in b) {
            if(a[key] !== b[key]) {
                return false;
            }
        }
        return true;
    }

}

import { ModalProps } from '@material-ui/core';
import { PureComponent } from 'react';
import { ModalOnCloseHandler } from '../types/modal-on-close-handler.type';

export type ModalComponentProps = {
    onClose: ModalOnCloseHandler;
} & Omit<ModalProps, 'children'>;

export abstract class ModalComponent<P = {}, S = {}> extends PureComponent<P & ModalComponentProps, S> {

    protected _isMounted = true;

    componentWillUnmount() {
        this._isMounted = false;
    }

}

import { Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ModalProps } from '@material-ui/core';
import React, { MouseEvent, ReactNode } from 'react';
import { Nullable } from '../../types';
import { CustomPureComponent } from '../base/custom-pure-component';

type RenderedProps = {
    title?: string;
    message?: string;
    confirmButtonLabel?: string;
    confirmButtonColor?: ButtonProps['color'];
};

type Props = {
    onAction: (event: MouseEvent, value: boolean) => void;
} & RenderedProps & Omit<ModalProps, 'children' | 'onExited'>;

/**
 * Generic dialog for displaying a simple alert with an action button and a
 * cancel button.
 */
export class AlertDialog extends CustomPureComponent<Props> {

    /**
     * Snapshot of the styling and text props. This allows the dialog to keep
     * displaying the same contents while it is undergoing its exit transition,
     * even if the props were cleared by the parent component.
     */
    private _propsSnapshot: Nullable<RenderedProps>;

    constructor(props: Props) {
        super(props);

        this._handleOnExited = this._handleOnExited.bind(this);
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<{}>): boolean {
        /*
         * If the dialog is about to close, then take snapshot of the current props.
         * The snapshot will be cleared after the dialog has existed.
         */
        if (!nextProps.open && this.props.open) {
            const {
                title,
                message,
                confirmButtonLabel,
                confirmButtonColor
            } = this.props;

            this._propsSnapshot = {
                title,
                message,
                confirmButtonLabel,
                confirmButtonColor
            };
        }

        return super.shouldComponentUpdate(nextProps, nextState);
    }

    render(): ReactNode {

        const {
            title,
            message,
            confirmButtonLabel,
            confirmButtonColor,
            onAction,
            ...dialogProps
        } = this._getProps();

        return (
            <Dialog {...dialogProps} onExited={this._handleOnExited}>
                {title && <DialogTitle>{title}</DialogTitle>}
                <DialogContent>
                    {message && <DialogContentText>{message}</DialogContentText>}
                </DialogContent>
                <DialogActions>
                    <Button color={confirmButtonColor} onClick={e => onAction(e, true)}>
                        {confirmButtonLabel || 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
 
    private _handleOnExited(): void {
        this._propsSnapshot = null;
    }

    /**
     * If the a props snapshot is present, then returns the current props merged
     * with the snapshot. Otherwise, the current props are returned.
     */
    private _getProps(): Props {
        if (!this._propsSnapshot) {
            return this.props;
        }
        return {
            ...this.props,
            ...this._propsSnapshot
        };
    }

}

import { ButtonProps } from '@mui/material';
import { DialogComponentProps } from '../../types/internal';
import { ModalComponent } from './modal-component';

type Props<T> = DialogComponentProps<T>;

type FullScreenProps = {
    fullScreen: boolean,
    closeIconEnabled: boolean,
    actionButtonVariant: ButtonProps['variant']
};

const DefaultActionButtonVariant = 'text';

const DefaultFullscreenActionButtonVariant = 'contained';

/**
 * @deprecated New dialogs should be function components and should use the
 * `useAutoResizeDialog` hook to compute full screen props.
 */
export abstract class DialogComponent<P extends Props<T>, S = {}, T = {}> extends ModalComponent<P, S> {

    shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>): boolean {
        const { open } = this.props;
        if (!open && !nextProps.open) {
            return false;
        }
        return super.shouldComponentUpdate(nextProps, nextState);
    }

    protected _computeFullScreenProps(): FullScreenProps {
        const fullScreen = this._isFullScreen();
        const closeIconEnabled = this._isCloseIconEnabled(fullScreen);
        const actionButtonVariant = this._getActionButtonVariant(fullScreen);
        return { fullScreen, closeIconEnabled, actionButtonVariant };
    }

    /**
     * If the `fullScreen` property was provided as a prop, then use its value.
     * Otherwise, compute the value based on whether the screen width is within the
     * `xs` breakpoint.
     */
    private _isFullScreen(): boolean {
        const { fullScreen, width } = this.props;
        if (fullScreen !== undefined) {
            return fullScreen as boolean;
        }
        return width === 'xs';
    }

    private _isCloseIconEnabled(fullScreen: boolean): boolean {
        const { showCloseIcon } = this.props;
        if (showCloseIcon === 'always') {
            return true;
        } else if (showCloseIcon === 'never') {
            return false;
        }
        return fullScreen;
    }

    private _getActionButtonVariant(fullScreen: boolean): ButtonProps['variant'] {
        return fullScreen ? DefaultFullscreenActionButtonVariant : DefaultActionButtonVariant;
    }

}

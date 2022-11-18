import { ReactNode } from 'react';
import { GlobalDialog } from './global-dialog.enum';

type BaseGlobalDialogOpenAction<D extends GlobalDialog> = {

    /**
     * The dialog to open.
     */
    dialog: D;

    /**
     * The callback that is invoked when the dialog is closed.
     */
    onClose: () => void;
};

type BaseGlobalDialogOpenActionWithOptions<D extends GlobalDialog, O extends object = object> = BaseGlobalDialogOpenAction<D> & {
    options: O
};

export type LoginDialogOpenAction = BaseGlobalDialogOpenAction<GlobalDialog.Login>;

export type NavigationBlockerDialogOptions = {
    cancelButtonLabel?: string;
    confirmButtonLabel?: string;
    onCancel: () => void;
    onConfirm: () => void;
    prompt: ReactNode;
    title?: string;
};

export type NavigationBlockerDialogOpenAction = BaseGlobalDialogOpenActionWithOptions<GlobalDialog.NavigationBlocker, NavigationBlockerDialogOptions>;

export type GlobalDialogOpenAction =
    LoginDialogOpenAction |
    NavigationBlockerDialogOpenAction;

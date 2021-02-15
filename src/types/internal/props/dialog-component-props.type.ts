import { DialogProps } from '@material-ui/core';
import { ModalComponentProps } from './modal-component-props.type';
import { WithWidthProps } from './with-width-props.type';

export type DialogComponentProps<T = {}> = {
    /**
     * Whether to show the close icon button at the top right corner of the dialog.
     * The exact behavior depends on the dialog implementation, but the general
     * behavior is as follows:
     * - `auto` (default): Only show when `fullScreen` mode is active.
     * - `always`: Always show the close button.
     * - `never`: Never show the close button.
     */
    showCloseIcon?: 'auto' | 'always' | 'never';
} & DialogProps & ModalComponentProps<T> & Partial<WithWidthProps>;

import { DialogProps } from '@mui/material';
import { ModalOnCloseHandler } from './ModalOnCloseHandler.type';

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

    onClose: ModalOnCloseHandler<T>;

} & Omit<DialogProps, 'children' | 'onClose'>;

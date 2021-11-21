import { ModalProps } from '@mui/material';
import { ModalOnCloseHandler } from '../modal-on-close-handler.type';

/**
 * @deprecated Currently no longer being used.
 */
export type ModalComponentProps<T = {}> = {
    onClose: ModalOnCloseHandler<T>;
} & Omit<ModalProps, 'children' | 'onClose'>;

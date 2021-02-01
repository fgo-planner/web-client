import { ModalProps } from '@material-ui/core';
import { ModalOnCloseHandler } from '../modal-on-close-handler.type';

export type ModalComponentProps<T = {}> = {
    onClose: ModalOnCloseHandler<T>;
} & Omit<ModalProps, 'children' | 'onClose'>;

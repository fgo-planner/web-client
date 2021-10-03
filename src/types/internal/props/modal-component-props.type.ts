import { ModalProps } from '@mui/material';
import { ModalOnCloseHandler } from '../modal-on-close-handler.type';

export type ModalComponentProps<T = {}> = {
    onClose: ModalOnCloseHandler<T>;
} & Omit<ModalProps, 'children' | 'onClose'>;

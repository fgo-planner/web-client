import { ModalOnCloseReason } from './modal-on-close-reason.type';

export type ModalOnCloseHandler<T = {}> = (event: any, reason: ModalOnCloseReason, data?: T) => void;
import { ModalOnCloseReason } from './modal-on-close-reason.type';

export type ModalOnCloseHandler<T = {}, R = ModalOnCloseReason> = (event: any, reason: R, data?: T) => void;
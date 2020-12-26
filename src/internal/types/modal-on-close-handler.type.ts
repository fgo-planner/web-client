import { ModalOnCloseReason } from './modal-on-close-reason.type';

export type ModalOnCloseHandler = (event: any, reason: ModalOnCloseReason) => void;
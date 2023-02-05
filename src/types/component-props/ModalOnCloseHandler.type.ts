import { ModalOnCloseReason } from './ModalOnCloseReason.type';

export type ModalOnCloseHandler<T = {}, R = ModalOnCloseReason> = (event: any, reason: R, data?: T) => void;
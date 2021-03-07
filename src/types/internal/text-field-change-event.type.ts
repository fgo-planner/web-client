import { ChangeEvent } from 'react';

/**
 * Short for `ChangeEvent<HTMLInputElement | HTMLTextAreaElement>`, because I 
 * don't want to keep having to declare a long ass type in every `onChange`
 * handler function.
 */
export type TextFieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

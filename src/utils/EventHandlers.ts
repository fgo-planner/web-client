import { UIEvent } from 'react';

/**
 * Contains common `UIEvent` handler functions.
 */
export namespace EventHandlers {

    export const preventDefault = (e: UIEvent): void => {
        e.preventDefault();
    };

    export const stopPropagation = (event: UIEvent): void => {
        event.stopPropagation();
    };

}

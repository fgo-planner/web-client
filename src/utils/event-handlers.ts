import { UIEvent } from 'react';

const preventDefault = (e: UIEvent): void => {
    e.preventDefault();
};

const stopPropagation = (event: UIEvent): void => {
    event.stopPropagation();
};

/**
 * Contains common `UIEvent` handler functions.
 */
export const EventHandlers = {
    preventDefault,
    stopPropagation
};

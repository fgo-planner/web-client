import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react';

type InitialState<S> = S | (() => S);

type ReturnType<R> = [R, R, Dispatch<SetStateAction<R>>];

export function useDebounce<S = undefined>(delay: number): ReturnType<S | undefined>;
export function useDebounce<S>(delay: number, initialState: InitialState<S>): ReturnType<S>;
export function useDebounce<S>(delay: number, initialState?: InitialState<S>): ReturnType<S | undefined> {

    const debounceTimeout = useRef<NodeJS.Timeout>();

    const [actualState, setActualState] = useState(initialState);

    const [debouncedState, setDebouncedState] = useState(actualState);

    const setState = useCallback((action: SetStateAction<S | undefined>): void => {
        clearTimeout(debounceTimeout.current);
        setActualState(action);
        debounceTimeout.current = setTimeout(() => {
            setActualState(state => {
                setDebouncedState(state);
                return state;
            });
        }, delay);
    }, [delay]);

    return [
        actualState,
        debouncedState,
        setState
    ];

}
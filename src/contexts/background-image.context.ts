import { createContext } from 'react';

export type BackgroundImageContextProps = {
    imageUrl?: string;
    blur?: number;
};

export const BackgroundImageContext = createContext<BackgroundImageContextProps>({
    blur: 0
});

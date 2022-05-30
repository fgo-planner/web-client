import { createContext } from 'react';
import { Supplier } from '../types/internal';

export type NavigationDrawerContextProps = {
    animationsDisabled: boolean;
    expanded: boolean;
    mobileView: boolean;
    onClose: Supplier<void>;
    open: boolean;
};

export const NavigationDrawerContext = createContext<NavigationDrawerContextProps>({
    animationsDisabled: false,
    expanded: false,
    mobileView: false,
    onClose: () => {},
    open: false
});

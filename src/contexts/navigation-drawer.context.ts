import { Supplier } from '@fgo-planner/common-core';
import { createContext } from 'react';

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

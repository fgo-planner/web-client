import { useEffect, useRef } from 'react';
import { AppBarService } from '../../services/user-interface/app-bar.service';
import { ThemeConstants } from '../../styles/theme-constants';

const handleScroll = (event: Event): void => {
    const scrollAmount = (event.target as Element)?.scrollTop;
    const appBarElevated = scrollAmount > ThemeConstants.AppBarElevatedScrollThreshold;
    AppBarService.setElevated(appBarElevated);
};

/**
 * Automatically sets the app bar elevation state based on the reference `div`
 * element's vertical scroll. Also automatically resets the elevation state to
 * `false` when the component is unmounted.
 * 
 * @returns A ref object that must be attached to a target `div` element.
 */
export const useElevateAppBarOnScroll = () => {

    useEffect(() => {
        return () => AppBarService.setElevated(false);
    }, []);

    const scrollContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = scrollContainer.current;
        if (!element) {
            return;
        }
        element.onscroll = handleScroll;
    }, []);

    return scrollContainer;

};
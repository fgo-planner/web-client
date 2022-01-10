import { useEffect, useRef } from 'react';
import { AppBarService } from '../../services/user-interface/app-bar.service';
import { ThemeConstants } from '../../styles/theme-constants';
import { useInjectable } from '../dependency-injection/use-injectable.hook';

/**
 * Automatically sets the app bar elevation state based on the reference `div`
 * element's vertical scroll. Also automatically resets the elevation state to
 * `false` when the component is unmounted.
 * 
 * @returns A ref object that must be attached to a target `div` element.
 */
export const useElevateAppBarOnScroll = () => {

    const appBarService = useInjectable(AppBarService);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollContainerElementRef = useRef<HTMLDivElement | null>(null);

    /*
     * Resets the app bar elevated state to `false` when the component using this
     * hook unmounts.
     */
    useEffect(() => {
        return () => appBarService.setElevated(false);
    }, [appBarService]);

    /*
     * This is called on every render. Checks if the target scroll element has
     * changed. If it has, then rebinds the `onscroll` event handler to the new
     * element.
     */
    useEffect(() => {
        const element = scrollContainerRef.current;
        if (element === scrollContainerElementRef.current) {
            return;
        }
        scrollContainerElementRef.current = element;
        /*
         * Element could have been removed from the DOM.
         */
        if (!element) {
            return;
        }
        /*
         * Bind handler for the `onscroll` event.
         */
        element.onscroll = (event: Event): void => {
            const scrollAmount = (event.target as Element)?.scrollTop;
            const appBarElevated = scrollAmount > ThemeConstants.AppBarElevatedScrollThreshold;
            appBarService.setElevated(appBarElevated);
        };
    });

    return scrollContainerRef;

};
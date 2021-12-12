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

    useEffect(() => {
        return () => appBarService.setElevated(false);
    }, [appBarService]);

    const scrollContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = scrollContainer.current;
        if (!element) {
            return;
        }
        element.onscroll = (event: Event): void => {
            const scrollAmount = (event.target as Element)?.scrollTop;
            const appBarElevated = scrollAmount > ThemeConstants.AppBarElevatedScrollThreshold;
            appBarService.setElevated(appBarElevated);
        };
    }, [appBarService]);

    return scrollContainer;

};
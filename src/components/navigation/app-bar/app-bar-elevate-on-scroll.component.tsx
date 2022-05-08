import { styled, SystemStyleObject, Theme } from '@mui/system';
import React, { DOMAttributes, PropsWithChildren, useEffect, useRef } from 'react';
import { useInjectable } from '../../../hooks/dependency-injection/use-injectable.hook';
import { AppBarService } from '../../../services/user-interface/app-bar.service';
import { ThemeConstants } from '../../../styles/theme-constants';
import { ComponentStyleProps } from '../../../types/internal';

type Props = PropsWithChildren<{}> & ComponentStyleProps & DOMAttributes<HTMLDivElement>;

// This component does not need StyleClassPrefix.

const RootComponent = styled('div')<{}>(() => ({
    overflow: 'auto',
    height: '100%'
} as SystemStyleObject<Theme> as {}));

/**
 * Utility component that automatically sets the app bar's elevation state based
 * on the component's vertical scroll. Also automatically resets the elevation
 * state to `false` when the component is unmounted.
 *
 * Intended to be used as a wrapper for full page components.
 */
export const AppBarElevateOnScroll = React.memo((props: Props) => {

    const {
        children,
        sx,
        ...componentProps
    } = props;

    const appBarService = useInjectable(AppBarService);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    /*
     * Resets the app bar elevated state to `false` when the component unmounts.
     */
    useEffect(() => {
        return () => appBarService.setElevated(false);
    }, [appBarService]);

    useEffect(() => {
        const element = scrollContainerRef.current;
        if (!element || element.onscroll) {
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
    }, [appBarService]);

    return (
        <RootComponent {...componentProps} ref={scrollContainerRef}>
            {children}
        </RootComponent>
    );

});

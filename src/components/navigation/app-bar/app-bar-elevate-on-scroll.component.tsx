import { CSSProperties } from '@mui/styles';
import { styled } from '@mui/system';
import React, { DOMAttributes, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useInjectable } from '../../../hooks/dependency-injection/use-injectable.hook';
import { UserInterfaceService } from '../../../services/user-interface/user-interface.service';
import { ThemeConstants } from '../../../styles/theme-constants';
import { ComponentStyleProps } from '../../../types/internal';

type Props = PropsWithChildren<{}> & ComponentStyleProps & DOMAttributes<HTMLDivElement>;

// This component does not need StyleClassPrefix.

const RootComponent = styled('div')<{}>(() => ({
    overflow: 'auto',
    height: '100%'
} as CSSProperties));

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

    const userInterfaceService = useInjectable(UserInterfaceService);

    const [, setElevationRequestId] = useState<string>();

    const elevationRequestIdRef = useRef<string>();

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    /*
     * Cancels the elevation request from the component when the component unmounts.
     */
    useEffect(() => {
        return () => {
            const elevationRequestId = elevationRequestIdRef.current;
            if (elevationRequestId) {
                userInterfaceService.waiveAppBarElevation(elevationRequestId);
            }
        };
    }, [userInterfaceService]);

    useEffect(() => {
        const element = scrollContainerRef.current;
        if (!element || element.onscroll) {
            return;
        }
        /*
         * Bind handler for the `onscroll` event.
         */
        element.onscroll = (event: Event): void => {
            let elevationRequestId = elevationRequestIdRef.current;
            const scrollAmount = (event.target as Element)?.scrollTop;
            const shouldElevate = scrollAmount > ThemeConstants.AppBarElevatedScrollThreshold;
            if (shouldElevate && !elevationRequestId) {
                elevationRequestId = userInterfaceService.invokeAppBarElevation();
            } else if (!shouldElevate && elevationRequestId) {
                userInterfaceService.waiveAppBarElevation(elevationRequestId);
                elevationRequestId = undefined;
            }
            setElevationRequestId(elevationRequestIdRef.current = elevationRequestId);
        };
    }, [userInterfaceService]);

    return (
        <RootComponent {...componentProps} ref={scrollContainerRef}>
            {children}
        </RootComponent>
    );

});

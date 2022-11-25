import { CSSInterpolation, styled } from '@mui/system';
import React, { DOMAttributes, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useInjectable } from '../../../hooks/dependency-injection/use-injectable.hook';
import { LockableFeature, UserInterfaceService } from '../../../services/user-interface/user-interface.service';
import { ThemeConstants } from '../../../styles/theme-constants';
import { ComponentStyleProps } from '../../../types';

type Props = PropsWithChildren<{}> & ComponentStyleProps & DOMAttributes<HTMLDivElement>;

// This component does not need StyleClassPrefix.

const RootComponent = styled('div')<{}>(() => ({
    overflow: 'auto',
    height: '100%'
} as CSSInterpolation));

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

    const [, setLockId] = useState<string>();

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    /**
     * Cancels the elevation request from the component when the component unmounts.
     */
    useEffect(() => {
        return () => {
            setLockId(lockId => {
                if (lockId) {
                    userInterfaceService.releaseLock(LockableFeature.AppBarElevate, lockId);
                }
                return lockId;
            });
        };
    }, [userInterfaceService]);

    useEffect(() => {
        const element = scrollContainerRef.current;
        if (!element || element.onscroll) {
            return;
        }
        /**
         * TODO This may be called twice for each `setLockId` call in development mode
         * due to strict mode.
         */
        const setLockIdAction = (lockId?: string): string | undefined => {
            const scrollAmount = element.scrollTop;
            const shouldElevate = scrollAmount > ThemeConstants.AppBarElevatedScrollThreshold;
            if (shouldElevate && !lockId) {
                lockId = userInterfaceService.requestLock(LockableFeature.AppBarElevate);
            } else if (!shouldElevate && lockId) {
                userInterfaceService.releaseLock(LockableFeature.AppBarElevate, lockId);
                lockId = undefined;
            }
            return lockId;
        };
        /**
         * Bind handler for the `onscroll` event.
         */
        element.onscroll = (_event: Event): void => {
            setLockId(setLockIdAction);
        };
    }, [userInterfaceService]);

    return (
        <RootComponent {...componentProps} ref={scrollContainerRef}>
            {children}
        </RootComponent>
    );

});

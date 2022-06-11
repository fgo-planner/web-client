import { Drawer } from '@mui/material';
import React, { useContext } from 'react';
import { NavigationDrawerContext } from '../../../contexts/navigation-drawer.context';
import { NavigationDrawerContent as Content } from '../../../types/internal';
import { NavigationDrawerContent } from './navigation-drawer-content.component';

type Props = {
    content: Content;
};

/**
 * Variant of the navigation drawer for mobile view. This variant utilizes MUI's
 * `Drawer` implementation.
 */
export const NavigationDrawerMobile = React.memo(({ content }: Props) => {

    const {
        animationsDisabled,
        onClose,
        open
    } = useContext(NavigationDrawerContext);

    const transitionDuration = animationsDisabled ? 0 : undefined;

    return (
        <Drawer
            variant='temporary'
            open={open}
            onClose={onClose}
            transitionDuration={transitionDuration}
            keepMounted
        >
            <NavigationDrawerContent content={content} />
        </Drawer>
    );

});

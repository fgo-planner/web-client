import { Drawer } from '@mui/material';
import React from 'react';
import { NavigationDrawerContent as Content, Supplier } from '../../../types/internal';
import { NavigationDrawerContent } from './navigation-drawer-content.component';

type Props = {
    content: Content;
    onClose: Supplier<void>;
    open: boolean;
};

/**
 * Variant of the navigation drawer for mobile view. This variant utilizes MUI's
 * `Drawer` implementation.
 */
export const NavigationDrawerMobile = React.memo((props: Props) => {

    const {
        content,
        onClose,
        open
    } = props;

    return (
        <Drawer
            variant='temporary'
            open={open}
            onClose={onClose}
            keepMounted
        >
            <NavigationDrawerContent
                content={content}
                onClose={onClose}
                expanded
                mobileView
            />
        </Drawer>
    );

});

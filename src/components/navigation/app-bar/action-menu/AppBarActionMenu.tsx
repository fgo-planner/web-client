import { Menu, PaperProps, PopoverOrigin } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import React, { PropsWithChildren, useMemo } from 'react';
import { ThemeConstants } from '../../../../styles/ThemeConstants';
import { ComponentStyleProps, ModalOnCloseHandler } from '../../../../types';
import { StyleClassPrefix as AppBarActionMenuItemStyleClassPrefix } from './AppBarActionMenuItem';

type Props = PropsWithChildren<{
    anchorEl?: Element | null;
    onClose?: ModalOnCloseHandler;
}> & Pick<ComponentStyleProps, 'className' | 'sx'>;

const MenuAnchorOrigin: PopoverOrigin = {
    vertical: 'bottom',
    horizontal: 'right'
};

const MenuTransformOrigin: PopoverOrigin = {
    vertical: -1 * ThemeConstants.Spacing,
    horizontal: 'right'
};

export const StyleClassPrefix = 'AppBarActionMenu';

const StyleProps = {
    [`& .${AppBarActionMenuItemStyleClassPrefix}-root`]: {
        height: 40,
        '& .MuiListItemIcon-root': {
            color: 'text.disabled',
            minWidth: 'initial',
            mr: 6
        },
        '& .MuiListItemText-primary': {
            fontSize: '0.875rem'
        }
    }
} as SystemStyleObject<Theme>;

export const AppBarActionMenu = React.memo((props: Props) => {

    const {
        children,
        anchorEl,
        onClose,
        className,
        sx
    } = props;

    const paperProps = useMemo((): Partial<PaperProps> => ({
        className,
        sx
    }), [className, sx]);

    return (
        <Menu
            className={`${StyleClassPrefix}-root`}
            sx={StyleProps}
            PaperProps={paperProps}
            anchorEl={anchorEl}
            // getContentAnchorEl={null}
            anchorOrigin={MenuAnchorOrigin}
            transformOrigin={MenuTransformOrigin}
            open={!!anchorEl}
            onClose={onClose}
            keepMounted
        >
            {children}
        </Menu>
    );

});

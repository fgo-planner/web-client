import { Menu, PopoverOrigin } from '@material-ui/core';
import React, { PureComponent, ReactNode } from 'react';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { ComponentStyleProps, ModalOnCloseHandler } from '../../../../types/internal';

type Props = {
    className?: string;
    anchorEl?: Element | null;
    onClose?: ModalOnCloseHandler;
} & ComponentStyleProps;

export class AppBarActionMenu extends PureComponent<Props> {

    private readonly MenuAnchorOrigin: PopoverOrigin = {
        vertical: 'bottom',
        horizontal: 'right'
    };

    private readonly MenuTransformOrigin: PopoverOrigin = {
        vertical: -1 * ThemeConstants.Spacing,
        horizontal: 'right'
    };

    render(): ReactNode {
        const { children, className, anchorEl, onClose } = this.props;
        return (
            <Menu
                PaperProps={{ className }}
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={this.MenuAnchorOrigin}
                transformOrigin={this.MenuTransformOrigin}
                open={!!anchorEl}
                onClose={onClose}
                keepMounted
            >
                {children}
            </Menu>
        );
    }

};

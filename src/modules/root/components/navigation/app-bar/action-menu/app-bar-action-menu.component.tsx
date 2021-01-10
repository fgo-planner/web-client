import { Menu, PopoverOrigin, StyledComponentProps, withTheme } from '@material-ui/core';
import { ModalOnCloseHandler, WithThemeProps } from 'internal';
import React, { PureComponent, ReactNode } from 'react';
import { ThemeConstants } from 'styles';

type Props = {
    className?: string;
    anchorElement?: Element | null;
    onClose?: ModalOnCloseHandler;
} & WithThemeProps & StyledComponentProps;

export const AppBarActionMenu = withTheme(class extends PureComponent<Props> {

    private readonly MenuAnchorOrigin: PopoverOrigin = {
        vertical: 'bottom',
        horizontal: 'right'
    };

    private readonly MenuTransformOrigin: PopoverOrigin = {
        vertical: -1 * ThemeConstants.Spacing,
        horizontal: 'right'
    };

    render(): ReactNode {
        return (
            <Menu PaperProps={{ className: this.props.className }}
                  anchorEl={this.props.anchorElement}
                  getContentAnchorEl={null}
                  anchorOrigin={this.MenuAnchorOrigin}
                  transformOrigin={this.MenuTransformOrigin}
                  open={!!this.props.anchorElement}
                  onClose={this.props.onClose}
                  keepMounted>
                {this.props.children}
            </Menu>
        );
    }

});

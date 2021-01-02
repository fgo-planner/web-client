import { Menu, PopoverOrigin, StyledComponentProps, StyleRules, Theme, withStyles } from '@material-ui/core';
import { ModalOnCloseHandler, WithStylesProps, WithThemeProps } from 'internal';
import React, { PureComponent, ReactNode } from 'react';
import { ThemeConstants } from 'styles';
import { ThemeUtils } from 'utils';

type Props = {
    className?: string;
    anchorElement?: Element | null;
    onClose?: ModalOnCloseHandler;
} & WithThemeProps & WithStylesProps & StyledComponentProps;

const style = (theme: Theme) => ({
    root: {
        '& .MuiListItem-root': {
            height: ThemeUtils.spacingInPixels(theme, 10),
            '& .MuiListItemIcon-root': {
                color: theme.palette.text.hint,
                minWidth: 'initial',
                marginRight: theme.spacing(6)
            },
            '& .MuiListItemText-primary': {
                fontSize: '14px'
            }
        }
    }
} as StyleRules);

export const AppBarActionMenu = withStyles(style, { withTheme: true })(class extends PureComponent<Props> {

    private readonly MenuAnchorOrigin: PopoverOrigin = {
        vertical: 'bottom',
        horizontal: 'right'
    };

    private readonly MenuTransformOrigin: PopoverOrigin = {
        vertical: -1 * ThemeConstants.Spacing,
        horizontal: 'right'
    };

    private get _className(): string {
        let className = this.props.classes.root;
        if (this.props.className) {
            className += ` ${this.props.className}`;
        }
        return className;
    }

    render(): ReactNode {
        return (
            <Menu PaperProps={{ className: this._className }}
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

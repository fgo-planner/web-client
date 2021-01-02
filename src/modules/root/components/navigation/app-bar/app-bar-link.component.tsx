import { fade, StyleRules, Theme, withStyles } from '@material-ui/core';
import { RouteLinkDefinition, WithStylesProps, WithThemeProps } from 'internal';
import React, { PureComponent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeConstants } from 'styles';
import { ThemeUtils } from 'utils';

type Props = {
    active?: boolean;
    link: RouteLinkDefinition;
} & WithThemeProps & WithStylesProps;

const style = (theme: Theme) => ({
    root: {
        cursor: 'pointer',
        color: theme.palette.primary.main,
        textDecoration: 'none',
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontWeight: 500,
        boxSizing: 'border-box',
        lineHeight: ThemeUtils.spacingInPixels(theme, ThemeConstants.AppBarHeightScale),
        margin: theme.spacing(0, 2),
        padding: theme.spacing(0, 2),
        borderBottom: '4px solid transparent',
        transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        '&:hover': {
            background: fade(theme.palette.primary.main, 0.04)
        }
    },
    active: {
        borderBottom: `4px solid ${theme.palette.primary.main}`
    }
} as StyleRules);

export const AppBarLink = withStyles(style, {withTheme: true})(class extends PureComponent<Props> {

    private get _className(): string {
        let className = this.props.classes.root;
        if (this.props.active) {
            className += ` ${this.props.classes.active}`;
        }
        return className;
    }

    render(): ReactNode {
        if (this.props.link.route) {
            return this._renderAsLink();
        }
        return (
            <div className={this._className} onClick={this.props.link.onClick}>
                {this.props.link.label}
            </div>
        );
    }

    private _renderAsLink() {
        return (
            <Link className={this._className} 
                  to={this.props.link.route as string} // Route is never undefined here.
                  onClick={this.props.link.onClick}>
                {this.props.link.label}
            </Link>
        )
    }

});
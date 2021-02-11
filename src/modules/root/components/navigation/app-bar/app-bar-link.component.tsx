import { fade, StyleRules, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { RouteLinkDefinition, WithStylesProps } from 'internal';
import React, { MouseEventHandler, PureComponent, ReactNode } from 'react';
import { Link, RouteComponentProps as ReactRouteComponentProps, withRouter } from 'react-router-dom';
import { ThemeConstants } from 'styles';
import { StyleUtils } from 'utils';

type Props = {
    onMouseOver?: MouseEventHandler;
    onMouseOut?: MouseEventHandler;
} & RouteLinkDefinition & ReactRouteComponentProps & WithStylesProps;

const style = (theme: Theme) => ({
    root: {
        cursor: 'pointer',
        color: theme.palette.primary.main,
        textDecoration: 'none',
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontWeight: 500,
        boxSizing: 'border-box',
        lineHeight: `${theme.spacing(ThemeConstants.AppBarHeightScale)}px`,
        margin: theme.spacing(0, 2),
        padding: theme.spacing(0, 2),
        borderBottom: '4px solid transparent',
        transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        '&:hover': {
            background: fade(theme.palette.primary.main, 0.04)
        }
    },
    active: {
        borderBottom: `4px solid ${theme.palette.primary.main}`
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'AppBarLink'
};

export const AppBarLink = withRouter(withStyles(style, styleOptions)(class extends PureComponent<Props> {

    render(): ReactNode {
        const { route, label, onClick, onMouseOver, onMouseOut } = this.props;
        const className = this._generateClassName();
        if (route) {
            // If route path was defined, then render it as a Link.
            return (
                <Link className={className} 
                      to={route}
                      onClick={onClick}
                      onMouseOver={onMouseOver}
                      onMouseOut={onMouseOut}>
                    {label}
                </Link>
            );
        }
        return (
            <div className={className}          
                 onClick={onClick}
                 onMouseEnter={onMouseOver}
                 onMouseLeave={onMouseOut}>
                {label}
            </div>
        );
    }

    private _generateClassName(): string {
        const { root, active } = this.props.classes;
        if (this._isLinkActive()) {
            return StyleUtils.appendClassNames(root, active);
        }
        return root;
    }

    private _isLinkActive(): boolean {
        const { route, exact, location } = this.props;
        if (!route) {
            return false;
        }
        if (exact) {
            return location?.pathname === route;
        } else {
            return location?.pathname.startsWith(route);
        }
    }

}));

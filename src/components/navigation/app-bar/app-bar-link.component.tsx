import { fade, StyleRules, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { MouseEventHandler, PureComponent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeConstants } from '../../../styles/theme-constants';
import { RouteLinkDefinition, WithStylesProps } from '../../../types';
import { StyleUtils } from '../../../utils/style.utils';

type Props = {
    active?: boolean;
    onMouseOver?: MouseEventHandler;
    onMouseOut?: MouseEventHandler;
} & RouteLinkDefinition & WithStylesProps;

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

export const AppBarLink = withStyles(style, styleOptions)(class extends PureComponent<Props> {

    render(): ReactNode {

        const { 
            classes,
            active,
            route, 
            label, 
            onClick, 
            onMouseOver, 
            onMouseOut 
        } = this.props;

        const className = StyleUtils.appendClassNames(classes.root, active && classes.active);

        // If route path was defined, then render it as a Link.
        if (route) {
            return (
                <Link
                    className={className}
                    to={route}
                    onClick={onClick}
                    onMouseOver={onMouseOver}
                    onMouseOut={onMouseOut}
                >
                    {label}
                </Link>
            );
        }

        // Otherwise, render it as a div.
        return (
            <div
                className={className}
                onClick={onClick}
                onMouseEnter={onMouseOver}
                onMouseLeave={onMouseOut}
            >
                {label}
            </div>
        );

    }

});

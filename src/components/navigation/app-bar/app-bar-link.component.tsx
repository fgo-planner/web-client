import { alpha, Theme } from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import clsx from 'clsx';
import { MouseEventHandler, PureComponent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeConstants } from '../../../styles/theme-constants';
import { WithStylesProps } from '../../../types/internal';

type Props = {
    active?: boolean;
    label: ReactNode;
    route?: string;
    onClick?: MouseEventHandler;
    onMouseOver?: MouseEventHandler;
    onMouseOut?: MouseEventHandler;
} & WithStylesProps;

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        color: theme.palette.primary.main,
        textDecoration: 'none',
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontWeight: 500,
        boxSizing: 'border-box',
        margin: theme.spacing(0, 2),
        padding: theme.spacing(0, 2),
        borderBottom: '4px solid transparent',
        transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        '&:hover': {
            background: alpha(theme.palette.primary.main, 0.04)
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

        const className = clsx(classes.root, active && classes.active);

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

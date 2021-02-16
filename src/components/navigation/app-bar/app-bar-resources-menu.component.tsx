import { fade, MenuItem, PaperProps, PopoverOrigin, StyleRules, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { MouseEvent, PureComponent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeConstants } from '../../../styles/theme-constants';
import { WithStylesProps } from '../../../types';
import { HoverMenu } from '../../menu/hover-menu.component';

type Props = {
    open: boolean;
    anchorEl?: Element | null;
} & WithStylesProps;

type State = {
    forceClosed: boolean;
};

const style = (theme: Theme) => ({
    paper: {
        width: '120px'
    },
    link: {
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontWeight: 500,
        color: theme.palette.primary.main,
        lineHeight: '32px',
        '&:hover': {
            background: fade(theme.palette.primary.main, 0.04)
        }
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'AppBarResourcesMenu'
};

export const AppBarResourcesMenu = withStyles(style, styleOptions)(class extends PureComponent<Props, State> {

    private readonly _menuAnchorOrigin: PopoverOrigin = {
        vertical: 'bottom',
        horizontal: 'right'
    };
    
    private readonly _menuTransformOrigin: PopoverOrigin = {
        vertical: 'top',
        horizontal: 'right'
    };

    private readonly _menuPaperProps: PaperProps;

    constructor(props: Props) {
        super(props);

        this.state = {
            forceClosed: false
        };

        this._handleLinkClick = this._handleLinkClick.bind(this);

        this._menuPaperProps = {
            elevation: 2,
            square: true,
            className: props.classes.paper
        };
    }

    componentDidUpdate() {
        const { open } = this.props;
        if (open) {
            this.setState({
                forceClosed: false
            });
        }
    }

    render(): ReactNode {
        const { classes, open, anchorEl } = this.props;
        const { forceClosed } = this.state;
        return (
            <HoverMenu
                open={open}
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                transitionDuration={100}
                forceClosed={forceClosed}
                anchorOrigin={this._menuAnchorOrigin}
                transformOrigin={this._menuTransformOrigin}
                PaperProps={this._menuPaperProps}
            >
                <MenuItem
                    className={classes.link}
                    component={Link}
                    to="/resources/servants"
                    onClick={this._handleLinkClick}
                >
                    Servants
                </MenuItem>
                <MenuItem
                    className={classes.link}
                    component={Link}
                    to="/resources/items"
                    onClick={this._handleLinkClick}
                >
                    Items
                </MenuItem>
                <MenuItem
                    className={classes.link}
                    component={Link}
                    to="/resources/events"
                    onClick={this._handleLinkClick}
                >
                    Events
                </MenuItem>
            </HoverMenu>
        );
    }

    private _handleLinkClick(event: MouseEvent): void {
        this.setState({
            forceClosed: true
        });
    }

});

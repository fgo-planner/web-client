import { alpha, MenuItem, PaperProps, PopoverOrigin } from '@mui/material';
import { Theme } from '@mui/system';
import React, { MouseEvent, PureComponent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeConstants } from '../../../styles/theme-constants';
import { HoverMenu } from '../../menu/hover-menu.component';

type Props = {
    open: boolean;
    anchorEl?: Element | null;
};

type State = {
    forceClosed: boolean;
};

// FIXME Convert styles to SystemStyleObject
const styles = {
    paper: {
        width: 120
    },
    link: (theme: Theme) => ({
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontWeight: 500,
        color: theme.palette.primary.main,
        lineHeight: '32px',
        '&:hover': {
            background: alpha(theme.palette.primary.main, 0.04)
        }
    })
};

// TODO Convert this to functional component
export const AppBarResourcesMenu = class extends PureComponent<Props, State> {

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
            style: styles.paper,
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
        const { open, anchorEl } = this.props;
        const { forceClosed } = this.state;
        return (
            <HoverMenu
                open={open}
                anchorEl={anchorEl}
                transitionDuration={100}
                forceClosed={forceClosed}
                anchorOrigin={this._menuAnchorOrigin}
                transformOrigin={this._menuTransformOrigin}
                PaperProps={this._menuPaperProps}
            >
                <MenuItem
                    sx={styles.link}
                    component={Link}
                    to="/resources/servants"
                    onClick={this._handleLinkClick}
                >
                    Servants
                </MenuItem>
                <MenuItem
                    sx={styles.link}
                    component={Link}
                    to="/resources/items"
                    onClick={this._handleLinkClick}
                >
                    Items
                </MenuItem>
                <MenuItem
                    sx={styles.link}
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

};

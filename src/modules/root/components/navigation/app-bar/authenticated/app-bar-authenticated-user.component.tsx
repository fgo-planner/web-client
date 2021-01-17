import { Avatar, Box, StyleRules, Theme, withStyles } from '@material-ui/core';
import { User } from 'data';
import { WithStylesProps } from 'internal';
import React, { Fragment, MouseEvent, PureComponent, ReactNode } from 'react';
import { ThemeConstants } from 'styles';
import { AppBarLink } from '../app-bar-link.component';
import { AppBarLinks } from '../app-bar-links.component';
import { AppBarGameAccountSelect } from './app-bar-game-account-select.component';
import { AppBarUserProfileMenu } from './app-bar-user-profile-menu.component';

type Props = {
    currentUser: User;
} & WithStylesProps;

type State = {
    profileMenu: {
        anchorElement?: Element | null;
    };
};

const style = (theme: Theme) => ({
    root: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: theme.spacing(4)
    },
    avatar: {
        cursor: 'pointer',
        width: theme.spacing(ThemeConstants.AppBarAvatarSize),
        height: theme.spacing(ThemeConstants.AppBarAvatarSize)
    }
} as StyleRules);

/**
 * Renders the app bar contents for an authenticated (logged in) user.
 */
export const AppBarAuthenticatedUser = withStyles(style)(class extends PureComponent<Props, State> {

    // Temporary
    private readonly AvatarImageUrl = 'https://assets.atlasacademy.io/GameData/JP/MasterFace/equip00052.png';

    constructor(props: Props) {
        super(props);
        this.state = {
            profileMenu: {
                anchorElement: null
            }
        };
        this._handleAvatarClick = this._handleAvatarClick.bind(this);
        this._handleProfileMenuClose = this._handleProfileMenuClose.bind(this);
    }

    render(): ReactNode {
        const styleClasses = this.props.classes;
        return (
            <Fragment>
                <div className={styleClasses.root}>
                    <AppBarGameAccountSelect />
                    <AppBarLinks>
                        <AppBarLink label="My Servants"
                                    route="/user/account/servants" />
                        <AppBarLink label="My Items"
                                    route="/user/account/items" />
                        <AppBarLink label="Planner"
                                    route="/user/account/planner" />
                    </AppBarLinks>
                    <Box flex={1} />
                    <AppBarLinks>
                        <AppBarLink label="Resources" />
                    </AppBarLinks>
                    <Avatar className={styleClasses.avatar}
                            src={this.AvatarImageUrl}
                            onClick={this._handleAvatarClick}
                    />
                </div>
                <AppBarUserProfileMenu currentUser={this.props.currentUser}
                                       anchorElement={this.state.profileMenu.anchorElement}
                                       onClose={this._handleProfileMenuClose}
                />
            </Fragment>
        );
    }

    private _handleAvatarClick(event: MouseEvent): void {
        this.setState({
            profileMenu: {
                ...this.state.profileMenu,
                anchorElement: event.currentTarget
            }
        });
    }

    private _handleProfileMenuClose(event: {}, reason: string): void {
        this.setState({
            profileMenu: {
                ...this.state.profileMenu,
                anchorElement: null
            }
        });
    }

});

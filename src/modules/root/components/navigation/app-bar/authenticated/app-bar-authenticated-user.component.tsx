import { Avatar, Box, StyleRules, Theme, withStyles } from '@material-ui/core';
import { User } from 'data';
import { RouteLinkDefinitions, WithStylesProps, WithThemeProps } from 'internal';
import React, { Fragment, MouseEvent, PureComponent, ReactNode } from 'react';
import { ThemeConstants } from 'styles';
import { ThemeUtils } from 'utils';
import { AppBarLinks } from '../app-bar-links.component';
import { AppBarUserProfileMenu } from './app-bar-user-profile-menu.component';

type Props = {
    currentUser: User;
} & WithThemeProps & WithStylesProps;

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
        padding: theme.spacing(0, 4)
    },
    avatar: {
        cursor: 'pointer',
        width: ThemeUtils.spacingInPixels(theme, ThemeConstants.AppBarAvatarSize),
        height: ThemeUtils.spacingInPixels(theme, ThemeConstants.AppBarAvatarSize)
    }
} as StyleRules);

/**
 * Renders the app bar contents for an authenticated (logged in) user.
 */
export const AppBarAuthenticatedUser = withStyles(style, { withTheme: true })(class extends PureComponent<Props, State> {

    // Temporary
    private readonly AvatarImageUrl = 'https://assets.atlasacademy.io/GameData/JP/MasterFace/equip00052.png';

    private readonly AccountLinks: RouteLinkDefinitions = [
        {
            label: 'My Servants'
        },
        {
            label: 'My Items'
        },
        {
            label: 'Planner'
        }
    ];

    // private readonly ResourceLink: RouteLinkDefinition = [
    //     {
    //         label: 'Servants',
    //         route: '/resources/servants'
    //     },
    //     {
    //         label: 'Items'
    //     },
    //     {
    //         label: 'Events',
    //         route: '/resources/events'
    //     },
    //     {
    //         label: 'Login',
    //         onClick: this._openLoginModal.bind(this)
    //     }
    // ];


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
                    <AppBarLinks links={this.AccountLinks} />
                    <Box flex={1} />
                    <AppBarLinks links={[{ label: 'Resources' }]} />
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

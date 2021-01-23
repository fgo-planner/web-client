import { Avatar, Box, StyleRules, Theme, withStyles } from '@material-ui/core';
import { MasterAccount, User } from 'data';
import { ReadonlyPartialArray, WithStylesProps } from 'internal';
import React, { Fragment, MouseEvent, PureComponent, ReactNode } from 'react';
import { Subscription } from 'rxjs';
import { MasterAccountService } from 'services';
import { ThemeConstants } from 'styles';
import { Container as Injectables } from 'typedi';
import { AppBarLink } from '../app-bar-link.component';
import { AppBarLinks } from '../app-bar-links.component';
import { AppBarMasterAccountAddButton } from './app-bar-master-account-add-button.component';
import { AppBarMasterAccountSelect } from './app-bar-master-account-select.component';
import { AppBarUserProfileMenu } from './app-bar-user-profile-menu.component';

type Props = {
    currentUser: User;
} & WithStylesProps;

type State = {
    profileMenu: {
        anchorElement?: Element | null;
    };
    masterAccountList: ReadonlyPartialArray<MasterAccount>;
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

    private _masterAccountService = Injectables.get(MasterAccountService);

    private _onMasterAccountListUpdatedSubscription!: Subscription;

    constructor(props: Props) {
        super(props);
        this.state = {
            profileMenu: {
                anchorElement: null
            },
            masterAccountList: []
        };
        this._handleAvatarClick = this._handleAvatarClick.bind(this);
        this._handleProfileMenuClose = this._handleProfileMenuClose.bind(this);
    }

    componentDidMount() {
        this._onMasterAccountListUpdatedSubscription = this._masterAccountService.onMasterAccountListUpdated
            .subscribe(this._handleMasterAccountListUpdated.bind(this));
    }

    componentWillUnmount() {
        this._onMasterAccountListUpdatedSubscription.unsubscribe();
    }

    render(): ReactNode {
        const { classes, currentUser } = this.props;
        const { profileMenu } = this.state;
        return (
            <Fragment>
                <div className={classes.root}>
                    {this._renderMasterAccountElements()}
                    <Box flex={1} />
                    <AppBarLinks>
                        <AppBarLink label="Resources" />
                    </AppBarLinks>
                    <Avatar className={classes.avatar}
                            src={this.AvatarImageUrl}
                            onClick={this._handleAvatarClick}
                    />
                </div>
                <AppBarUserProfileMenu currentUser={currentUser}
                                       anchorElement={profileMenu.anchorElement}
                                       onClose={this._handleProfileMenuClose}
                />
            </Fragment>
        );
    }

    /**
     * Renders the elements relevant to master accounts.
     */
    private _renderMasterAccountElements(): ReactNode {
        const { masterAccountList } = this.state;
        if (!masterAccountList.length) {
            return <AppBarMasterAccountAddButton />;
        }
        return [
            <AppBarMasterAccountSelect masterAccountList={masterAccountList} />,
            <AppBarLinks>
                <AppBarLink label="My Servants"
                            route="/user/master/servants" />
                <AppBarLink label="My Items"
                            route="/user/master/items" />
                <AppBarLink label="Planner"
                            route="/user/master/planner" />
            </AppBarLinks>
        ];
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

    private _handleMasterAccountListUpdated(accounts: ReadonlyPartialArray<MasterAccount>) {
        this.setState({
            masterAccountList: accounts
        });
    }

});

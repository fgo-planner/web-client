import { Avatar, StyleRules, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { Fragment, MouseEvent, PureComponent, ReactNode } from 'react';
import { RouteComponentProps as ReactRouteComponentProps, withRouter } from 'react-router-dom';
import { Subscription } from 'rxjs';
import { Container as Injectables } from 'typedi';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { MasterAccount, ModalOnCloseReason, ReadonlyPartialArray, User, WithStylesProps } from '../../../../types';
import { AppBarLink } from '../app-bar-link.component';
import { AppBarLinks } from '../app-bar-links.component';
import { AppBarResourcesMenu } from '../app-bar-resources-menu.component';
import { AppBarMasterAccountAddButton } from './app-bar-master-account-add-button.component';
import { AppBarMasterAccountSelect } from './app-bar-master-account-select.component';
import { AppBarUserProfileMenu } from './app-bar-user-profile-menu.component';

type Props = {
    currentUser: User;
} & WithStylesProps & ReactRouteComponentProps;

type State = {
    profileMenu: {
        anchorEl?: Element | null;
    };
    resourcesMenu: {
        open: boolean;
        anchorEl?: Element | null;
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

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'AppBarAuthenticatedUser'
};

/**
 * Renders the app bar contents for an authenticated (logged in) user.
 */
export const AppBarAuthenticatedUser = withRouter(withStyles(style, styleOptions)(class extends PureComponent<Props, State> {

    // Temporary
    private readonly AvatarImageUrl = 'https://assets.atlasacademy.io/GameData/JP/MasterFace/equip00052.png';

    private _masterAccountService = Injectables.get(MasterAccountService);

    private _onMasterAccountListUpdatedSubscription!: Subscription;

    constructor(props: Props) {
        super(props);

        this.state = {
            profileMenu: {
                anchorEl: null
            },
            resourcesMenu: {
                open: false,
                anchorEl: null
            },
            masterAccountList: []
        };

        this._handleResourcesLinkClick = this._handleResourcesLinkClick.bind(this);
        this._handleResourcesLinkMouseOver = this._handleResourcesLinkMouseOver.bind(this);
        this._handleResourcesLinkMouseOut = this._handleResourcesLinkMouseOut.bind(this);
        this._handleAvatarClick = this._handleAvatarClick.bind(this);
        this._handleProfileMenuClose = this._handleProfileMenuClose.bind(this);
    }

    componentDidMount(): void {
        this._onMasterAccountListUpdatedSubscription = this._masterAccountService.onMasterAccountListUpdated
            .subscribe(this._handleMasterAccountListUpdated.bind(this));
    }

    componentWillUnmount(): void {
        this._onMasterAccountListUpdatedSubscription.unsubscribe();
    }

    render(): ReactNode {
        const { classes, currentUser } = this.props;
        const { profileMenu, resourcesMenu } = this.state;
        return (
            <Fragment>
                <div className={classes.root}>
                    {this._renderMasterAccountElements()}
                    <div className="flex-fill" />
                    <AppBarLinks>
                        <AppBarLink
                            label="Resources"
                            onClick={this._handleResourcesLinkClick}
                            onMouseOver={this._handleResourcesLinkMouseOver}
                            onMouseOut={this._handleResourcesLinkMouseOut}
                        />
                    </AppBarLinks>
                    <Avatar
                        className={classes.avatar}
                        src={this.AvatarImageUrl}
                        onClick={this._handleAvatarClick}
                    />
                </div>
                <AppBarResourcesMenu
                    open={resourcesMenu.open}
                    anchorEl={resourcesMenu.anchorEl}
                />
                <AppBarUserProfileMenu
                    currentUser={currentUser}
                    anchorEl={profileMenu.anchorEl}
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
        return (
            <Fragment>
                <AppBarMasterAccountSelect key={0} masterAccountList={masterAccountList} />
                <AppBarLinks key={1} >
                    <AppBarLink
                        label="My Servants"
                        route="/user/master/servants"
                        active={this._isLinkActive('/user/master/servants')}
                    />
                    <AppBarLink
                        label="My Items"
                        route="/user/master/items"
                        active={this._isLinkActive('/user/master/items')}
                    />
                    <AppBarLink
                        label="Planner"
                        route="/user/master/planner"
                        active={this._isLinkActive('/user/master/planner')}
                    />
                </AppBarLinks>
            </Fragment>
        );
    }

    private _handleResourcesLinkClick(event: MouseEvent): void {
        this.setState({
            resourcesMenu: {
                ...this.state.resourcesMenu,
                open: !this.state.resourcesMenu.open
            }
        });
    }

    private _handleResourcesLinkMouseOver(event: MouseEvent): void {
        this.setState({
            resourcesMenu: {
                ...this.state.resourcesMenu,
                anchorEl: event.currentTarget,
                open: true
            }
        });
    }

    private _handleResourcesLinkMouseOut(event: MouseEvent): void {
        this.setState({
            resourcesMenu: {
                ...this.state.resourcesMenu,
                open: false
            }
        });
    }

    private _handleAvatarClick(event: MouseEvent): void {
        this.setState({
            profileMenu: {
                ...this.state.profileMenu,
                anchorEl: event.currentTarget
            }
        });
    }

    private _handleProfileMenuClose(event: {}, reason: ModalOnCloseReason): void {
        this.setState({
            profileMenu: {
                ...this.state.profileMenu,
                anchorEl: null
            }
        });
    }

    private _handleMasterAccountListUpdated(accounts: ReadonlyPartialArray<MasterAccount>): void {
        this.setState({
            masterAccountList: accounts
        });
    }
    
    private _isLinkActive(route: string, exact?: boolean): boolean {
        const { location } = this.props;
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

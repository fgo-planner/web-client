import { HomeOutlined as HomeOutlinedIcon } from '@mui/icons-material';
import { Avatar } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import React, { Fragment, MouseEvent, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { BasicUser } from '../../../../services/data/user/user.service';
import { MasterAccountList as MasterAccountListType } from '../../../../types/data';
import { ModalOnCloseReason, Nullable } from '../../../../types/internal';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { AppBarLink } from '../app-bar-link.component';
import { AppBarLinks } from '../app-bar-links.component';
import { AppBarResourcesMenu } from '../app-bar-resources-menu.component';
import { AppBarMasterAccountAddButton } from './app-bar-master-account-add-button.component';
import { AppBarMasterAccountSelect } from './app-bar-master-account-select.component';
import { AppBarUserProfileMenu } from './app-bar-user-profile-menu.component';

type Props = {
    currentUser: BasicUser;
};

// Temporary
const AvatarImageUrl = 'https://assets.atlasacademy.io/GameData/JP/MasterFace/equip00052.png';

const AvatarSize = 44;

// This component does not need StyleClassPrefix.

const StyleProps = {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    pr: 4,
    '& .MuiAvatar-root': {
        cursor: 'pointer',
        width: AvatarSize,
        height: AvatarSize
    }
} as SystemStyleObject<Theme>;

/**
 * Renders the app bar contents for an authenticated (logged in) user.
 */
export const AppBarAuthenticatedUser = React.memo(({ currentUser }: Props) => {
    const location = useLocation();

    const [masterAccountList, setMasterAccountList] = useState<Nullable<MasterAccountListType>>();
    const [resourcesMenuOpen, setResourcesMenuOpen] = useState<boolean>(false);
    const [resourcesMenuAnchorEl, setResourcesMenuAnchorEl] = useState<Element | null>(null);
    const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<Element | null>(null);

    /*
     * Master account list change subscription.
     */
    useEffect(() => {
        const onMasterAccountListChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.MasterAccountListChange)
            .subscribe(setMasterAccountList);

        return () => onMasterAccountListChangeSubscription.unsubscribe();
    }, []);

    const handleResourcesLinkClick = useCallback((event: MouseEvent): void => {
        setResourcesMenuOpen(!resourcesMenuOpen);
    }, [resourcesMenuOpen]);

    const handleResourcesLinkMouseOver = useCallback((event: MouseEvent): void => {
        setResourcesMenuOpen(true);
        setResourcesMenuAnchorEl(event.currentTarget);
    }, []);

    const handleResourcesLinkMouseOut = useCallback((event: MouseEvent): void => {
        setResourcesMenuOpen(false);
    }, []);

    const handleAvatarClick = useCallback((event: MouseEvent): void => {
        setProfileMenuAnchorEl(event.currentTarget);
    }, []);

    const handleProfileMenuClose = useCallback((event: {}, reason: ModalOnCloseReason): void => {
        setProfileMenuAnchorEl(null);
    }, []);

    const isLinkActive = (route: string, exact?: boolean): boolean => {
        if (!route) {
            return false;
        }
        if (exact) {
            return location?.pathname === route;
        } else {
            return location?.pathname.startsWith(route);
        }
    };

    const masterAccountNodes = !masterAccountList?.length ? <AppBarMasterAccountAddButton /> : (
        <Fragment>
            <AppBarMasterAccountSelect masterAccountList={masterAccountList} />
            <AppBarLinks>
                <AppBarLink
                    label={<HomeOutlinedIcon />}
                    route='/user/master'
                    active={isLinkActive('/user/master', true)}
                />
                <AppBarLink
                    label='My Servants'
                    route='/user/master/servants'
                    active={isLinkActive('/user/master/servants')}
                />
                <AppBarLink
                    label='My Items'
                    route='/user/master/items'
                    active={isLinkActive('/user/master/items')}
                />
                <AppBarLink
                    label='Planner'
                    route='/user/master/planner'
                    active={isLinkActive('/user/master/planner')}
                />
            </AppBarLinks>
        </Fragment>
    );

    return (
        <Fragment>
            <Box sx={StyleProps}>
                {masterAccountNodes}
                <div className='flex-fill' />
                <AppBarLinks>
                    <AppBarLink
                        label='Resources'
                        onClick={handleResourcesLinkClick}
                        onMouseOver={handleResourcesLinkMouseOver}
                        onMouseOut={handleResourcesLinkMouseOut}
                    />
                </AppBarLinks>
                <Avatar
                    className='avatar'
                    src={AvatarImageUrl}
                    onClick={handleAvatarClick}
                />
            </Box>
            <AppBarResourcesMenu
                open={resourcesMenuOpen}
                anchorEl={resourcesMenuAnchorEl}
            />
            <AppBarUserProfileMenu
                currentUser={currentUser}
                anchorEl={profileMenuAnchorEl}
                onClose={handleProfileMenuClose}
            />
        </Fragment>
    );

});

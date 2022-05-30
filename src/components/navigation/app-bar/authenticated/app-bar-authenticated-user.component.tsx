import { Avatar } from '@mui/material';
import { Box, SystemStyleObject } from '@mui/system';
import React, { MouseEvent, useCallback, useEffect, useState } from 'react';
import { BasicUser } from '../../../../services/data/user/user.service';
import { MasterAccountList as MasterAccountListType } from '../../../../types/data';
import { ModalOnCloseReason, Nullable } from '../../../../types/internal';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
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
    px: 4,
    '& .MuiAvatar-root': {
        cursor: 'pointer',
        width: AvatarSize,
        height: AvatarSize
    }
} as SystemStyleObject;

/**
 * Renders the app bar contents for an authenticated (logged in) user.
 */
export const AppBarAuthenticatedUser = React.memo(({ currentUser }: Props) => {

    const [masterAccountList, setMasterAccountList] = useState<Nullable<MasterAccountListType>>();
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

    const handleAvatarClick = useCallback((event: MouseEvent): void => {
        setProfileMenuAnchorEl(event.currentTarget);
    }, []);

    const handleProfileMenuClose = useCallback((event: {}, reason: ModalOnCloseReason): void => {
        setProfileMenuAnchorEl(null);
    }, []);

    const masterAccountSelectNode = masterAccountList?.length ?
        <AppBarMasterAccountSelect masterAccountList={masterAccountList} /> :
        <AppBarMasterAccountAddButton />;

    return (
        <>
            <Box sx={StyleProps}>
                {masterAccountSelectNode}
                <div className='flex-fill' />
                <Avatar
                    className='avatar'
                    src={AvatarImageUrl}
                    onClick={handleAvatarClick}
                />
            </Box>

            {/* TODO Change this to a drawer on mobile view */}
            <AppBarUserProfileMenu
                currentUser={currentUser}
                anchorEl={profileMenuAnchorEl}
                onClose={handleProfileMenuClose}
            />
        </>
    );

});

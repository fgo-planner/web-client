import { Nullable } from '@fgo-planner/common-core';
import { Avatar } from '@mui/material';
import { Box, SystemStyleObject } from '@mui/system';
import React, { MouseEvent, useCallback, useEffect, useState } from 'react';
import { BasicUser } from '../../../../services/data/user/UserService';
import { BasicMasterAccounts, ModalOnCloseReason } from '../../../../types';
import { SubscribablesContainer } from '../../../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../../../utils/subscription/SubscriptionTopics';
import { AppBarMasterAccountAddButton } from './AppBarMasterAccountAddButton';
import { AppBarMasterAccountSelect } from './AppBarMasterAccountSelect';
import { AppBarUserProfileMenu } from './AppBarUserProfileMenu';

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
    px: 3,
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

    const [masterAccountList, setMasterAccountList] = useState<Nullable<BasicMasterAccounts>>();
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

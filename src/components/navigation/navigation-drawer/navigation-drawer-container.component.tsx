import { MasterAccount } from '@fgo-planner/types';
import { CalendarMonth as CalendarMonthIcon, CalendarMonthOutlined as CalendarMonthOutlinedIcon, Category as CategoryIcon, CategoryOutlined as CategoryOutlinedIcon, Checkroom as CheckroomIcon, Dashboard as DashboardIcon, DashboardOutlined as DashboardOutlinedIcon, Group as GroupIcon, GroupOutlined as GroupOutlinedIcon, Inventory2 as Inventory2Icon, Inventory2Outlined as Inventory2OutlinedIcon, Login as LoginIcon, Logout as LogoutIcon, MusicNote as MusicNoteIcon, MusicNoteOutlined as MusicNoteOutlinedIcon, PeopleAlt as PeopleAltIcon, PeopleAltOutlined as PeopleAltOutlinedIcon, TheaterComedy as TheaterComedyIcon, TheaterComedyOutlined as TheaterComedyOutlinedIcon } from '@mui/icons-material';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject } from '@mui/system';
import React, { PropsWithChildren, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useInjectable } from '../../../hooks/dependency-injection/use-injectable.hook';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { UserInterfaceService } from '../../../services/user-interface/user-interface.service';
import { ThemeConstants } from '../../../styles/theme-constants';
import { NavigationDrawerContent as Content, NavigationDrawerSection as Section, Nullable, SxPropsFunction } from '../../../types/internal';
import { SubscribablesContainer } from '../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../utils/subscription/subscription-topics';
import { NavigationDrawerDesktop } from './navigation-drawer-desktop.component';
import { NavigationDrawerMobile } from './navigation-drawer-mobile.component';

type Props = PropsWithChildren<{
    mobileView?: boolean;
}>;

const MasterAccountRoutesSection: Section = {
    key: 'master-account',
    label: 'Master Account',
    items: [
        {
            key: 'account-dashboard',
            icon: DashboardOutlinedIcon,
            activeIcon: DashboardIcon,
            label: 'Dashboard',
            route: '/user/master',
            exact: true
        },
        {
            key: 'account-planner',
            icon: CalendarMonthOutlinedIcon,
            activeIcon: CalendarMonthIcon,
            label: 'Planner',
            route: '/user/master/planner'
        },
        {
            key: 'account-servants',
            icon: PeopleAltOutlinedIcon,
            activeIcon: PeopleAltIcon,
            label: 'Roster',
            tooltip: 'Servant Roster',
            route: '/user/master/servants'
        },
        {
            key: 'account-items',
            icon: Inventory2OutlinedIcon,
            activeIcon: Inventory2Icon,
            label: 'Inventory',
            route: '/user/master/items'
        },
        {
            key: 'account-costumes',
            icon: CheckroomIcon,
            label: 'Costumes',
            route: '/user/master/costumes'
        },
        {
            key: 'account-soundtracks',
            icon: MusicNoteOutlinedIcon,
            activeIcon: MusicNoteIcon,
            label: 'Soundtracks',
            route: '/user/master/soundtracks'
        }
    ]
};

const ResourceRoutesSection: Section = {
    key: 'resources',
    label: 'Resources',
    items: [
        {
            key: 'servants',
            icon: GroupOutlinedIcon,
            activeIcon: GroupIcon,
            label: 'Servants',
            route: '/resources/servants'
        },
        {
            key: 'items',
            icon: CategoryOutlinedIcon,
            activeIcon: CategoryIcon,
            label: 'Items',
            route: '/resources/items'
        },
        {
            key: 'events',
            icon: TheaterComedyOutlinedIcon,
            activeIcon: TheaterComedyIcon,
            label: 'Events',
            route: '/resources/events'
        }
    ]
};

const StyleClassPrefix = 'NavigationDrawerContainer';

const StyleProps = (({ spacing }: Theme) => ({
    display: 'flex',
    height: '100%',
    '& .MuiDrawer-root>.MuiPaper-root': {
        top: spacing(ThemeConstants.AppBarHeightScale),
        height: `calc(100% - ${spacing(ThemeConstants.AppBarHeightScale)})`
    },
    [`& .${StyleClassPrefix}-children`]: {
        display: 'flex', // This is needed to correctly display app bar shadow
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        overflow: 'hidden' // Prevents app bar shadow from bleeding over to the drawer
    }
} as SystemStyleObject)) as SxPropsFunction;

export const NavigationDrawerContainer = React.memo((props: Props) => {

    const {
        mobileView,
        children
    } = props;

    const authenticationService = useInjectable(AuthenticationService);
    const userInterfaceService = useInjectable(UserInterfaceService);

    const [open, setOpen] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();

    /*
     * User change subscription.
     */
    useEffect(() => {
        const onCurrentUserChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentUserChange)
            .subscribe(user => {
                setIsLoggedIn(!!user);
            });

        return () => onCurrentUserChangeSubscription.unsubscribe();
    }, []);

    /*
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(setMasterAccount);

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    /*
     * Side nav open state change subscription
     */
    useEffect(() => {
        const onNavigationDrawerOpenChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.UserInterface.NavigationDrawerOpenChange)
            .subscribe(setOpen);

        return () => onNavigationDrawerOpenChangeSubscription.unsubscribe();
    }, []);

    const handleDrawerClose = useCallback((): void => {
        userInterfaceService.setNavigationDrawerOpen(false);
    }, [userInterfaceService]);

    const content = useMemo((): Content => {
        const sections = [] as Array<Section>;
        /*
         * Add master account routes only if there is an active master account.
         */
        if (masterAccount) {
            sections.push(MasterAccountRoutesSection);
        }
        /*
         * Add resources route regardless if whether user is logged in.
         */
        sections.push(ResourceRoutesSection);
        /*
         * Add login/logout button depending on whether user is logged in.
         */
        if (isLoggedIn) {
            sections.push({
                key: 'logout',
                label: 'Account',
                items: [
                    {
                        key: 'logout',
                        icon: LogoutIcon,
                        label: 'Sign Out',
                        onClick: () => authenticationService.logout()
                    }
                ]
            });
        } else {
            sections.push({
                key: 'login',
                label: 'Account',
                items: [
                    {
                        key: 'login',
                        icon: LoginIcon,
                        label: 'Sign In',
                        onClick: () => console.log('Login button clicked') // TODO Open login dialog
                    }
                ]
            });
        }
        return { sections };
    }, [authenticationService, isLoggedIn, masterAccount]);

    const drawerNode = useMemo((): ReactNode => {
        if (mobileView) {
            return (
                <NavigationDrawerMobile
                    content={content}
                    onClose={handleDrawerClose}
                    open={open}
                />
            );
        } else {
            return (
                <NavigationDrawerDesktop
                    content={content}
                    onClose={handleDrawerClose}
                    open={open}
                />
            );
        }
    }, [content, handleDrawerClose, mobileView, open]);

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            {drawerNode}
            <div className={`${StyleClassPrefix}-children`}>
                {children}
            </div>
        </Box>
    );

});
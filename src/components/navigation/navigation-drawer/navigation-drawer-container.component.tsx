import { MasterAccount } from '@fgo-planner/data-types';
import { BusinessCenter as BusinessCenterIcon, BusinessCenterOutlined as BusinessCenterOutlinedIcon, CalendarMonth as CalendarMonthIcon, CalendarMonthOutlined as CalendarMonthOutlinedIcon, Category as CategoryIcon, CategoryOutlined as CategoryOutlinedIcon, Dashboard as DashboardIcon, DashboardOutlined as DashboardOutlinedIcon, Group as GroupIcon, GroupOutlined as GroupOutlinedIcon, Home as HomeIcon, HomeOutlined as HomeOutlinedIcon, Login as LoginIcon, Logout as LogoutIcon, MusicNote as MusicNoteIcon, MusicNoteOutlined as MusicNoteOutlinedIcon, PeopleAlt as PeopleAltIcon, PeopleAltOutlined as PeopleAltOutlinedIcon, Stadium as StadiumIcon, StadiumOutlined as StadiumOutlinedIcon, TheaterComedy as TheaterComedyIcon, TheaterComedyOutlined as TheaterComedyOutlinedIcon } from '@mui/icons-material';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject } from '@mui/system';
import React, { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { NavigationDrawerContext, NavigationDrawerContextProps } from '../../../contexts/navigation-drawer.context';
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
    mobileView: boolean;
}>;

const HomeButtonSection: Section = {
    key: 'home',
    hideDivider: true,
    items: [
        {
            key: 'app-home',
            icon: HomeOutlinedIcon,
            activeIcon: HomeIcon,
            label: 'Home',
            route: '/',
            exact: true
        }
    ]
};

const MasterAccountRoutesSection: Section = {
    key: 'master-account',
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
            icon: BusinessCenterOutlinedIcon,
            activeIcon: BusinessCenterIcon,
            label: 'Inventory',
            route: '/user/master/items'
        },
        {
            key: 'account-costumes',
            icon: TheaterComedyOutlinedIcon,
            activeIcon: TheaterComedyIcon,
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
            icon: StadiumOutlinedIcon,
            activeIcon: StadiumIcon,
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
        /*
         * Condensed app bar scaling is not needed because these rules only apply to
         * desktop screen widths, where condensed app bar is never displayed.
         */
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
    const [animationsDisabled, setAnimationsDisabled] = useState<boolean>(false);
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
     * Navigation drawer open state change subscription
     */
    useEffect(() => {
        const onNavigationDrawerOpenChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.UserInterface.NavigationDrawerOpenChange)
            .subscribe(setOpen);

        return () => onNavigationDrawerOpenChangeSubscription.unsubscribe();
    }, []);

    /*
     * Navigation drawer no animations change subscription
     */
    useEffect(() => {
        const onNavigationDrawerNoAnimationsChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.UserInterface.NavigationDrawerNoAnimationsChange)
            .subscribe(setAnimationsDisabled);

        return () => onNavigationDrawerNoAnimationsChangeSubscription.unsubscribe();
    }, []);

    const handleDrawerClose = useCallback((): void => {
        userInterfaceService.setNavigationDrawerOpen(false);
    }, [userInterfaceService]);

    const contextValue = useMemo((): NavigationDrawerContextProps => ({
        animationsDisabled,
        expanded: mobileView || open, // Contents are always displayed in expanded mode in mobile view.
        mobileView,
        onClose: handleDrawerClose,
        open
    }), [animationsDisabled, handleDrawerClose, mobileView, open]);

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
                items: [
                    {
                        key: 'logout',
                        icon: LogoutIcon,
                        label: 'Log Out',
                        onClick: () => authenticationService.logout()
                    }
                ]
            });
        } else {
            sections.unshift({
                key: 'login',
                items: [
                    {
                        key: 'login',
                        icon: LoginIcon,
                        label: 'Log In',
                        route: '/login',
                        onClick: () => userInterfaceService.setLoginDialogOpen(true)
                    }
                ]
            });
        }
        /*
         * Add home button to the top of the list.
         */
        sections.unshift(HomeButtonSection);
        return { sections };
    }, [authenticationService, isLoggedIn, masterAccount, userInterfaceService]);

    const drawerNode = mobileView ?
        <NavigationDrawerMobile content={content} /> :
        <NavigationDrawerDesktop content={content} />;

    return (
        <NavigationDrawerContext.Provider value={contextValue}>
            <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
                {drawerNode}
                <div className={`${StyleClassPrefix}-children`}>
                    {children}
                </div>
            </Box>
        </NavigationDrawerContext.Provider>
    );

});

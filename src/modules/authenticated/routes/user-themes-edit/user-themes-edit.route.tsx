import { Clear as ClearIcon, Save as SaveIcon } from '@mui/icons-material';
import { Fab, Tooltip } from '@mui/material';
import _ from 'lodash';
import React, { Fragment, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPreferences, UserWebClientTheme } from '../../../../../local_modules/types/lib';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { AppBarElevateOnScroll } from '../../../../components/navigation/app-bar/app-bar-elevate-on-scroll.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useLoadingIndicator } from '../../../../hooks/user-interface/use-loading-indicator.hook';
import { UserService } from '../../../../services/data/user/user.service';
import { ThemeService } from '../../../../services/user-interface/theme.service';
import { Nullable, ThemeMode } from '../../../../types/internal';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { UserThemeEdit } from './user-theme-edit.component';

export const UserThemesEditRoute = React.memo(() => {

    const navigate = useNavigate();
    
    const {
        invokeLoadingIndicator,
        resetLoadingIndicator,
        isLoadingIndicatorActive
    } = useLoadingIndicator();

    const themeService = useInjectable(ThemeService);
    const userService = useInjectable(UserService);

    /**
     * Clone of the user's light theme preferences.
     */
    const [lightTheme, setLightTheme] = useState<UserWebClientTheme>();
    /**
     * Clone of the user's dark theme preferences.
     */
    const [darkTheme, setDarkTheme] = useState<UserWebClientTheme>();

    const userPreferencesRef = useRef<Nullable<UserPreferences>>();

    useEffect(() => {
        const getUserThemeOrDefault = (userPreferences: Nullable<UserPreferences>, themeMode: ThemeMode): UserWebClientTheme => {
            const userTheme = userPreferences?.webClient.themes[themeMode];
            if (!userTheme) {
                return themeService.getDefaultUserWebClientTheme(themeMode);
            } else {
                return _.cloneDeep(userTheme); // Return a clone for editing
            }
        };

        const onCurrentUserPreferencesChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentUserPreferencesChange)
            .subscribe(userPreferences => {
                userPreferencesRef.current = userPreferences;
                setLightTheme(getUserThemeOrDefault(userPreferences, 'light'));
                setDarkTheme(getUserThemeOrDefault(userPreferences, 'dark'));
            });

        return () => onCurrentUserPreferencesChangeSubscription.unsubscribe();
    }, [themeService]);

    const handleSaveButtonClick = useCallback(async (): Promise<void> => {
        const userPreferences = userPreferencesRef.current;
        if (!userPreferences) {
            // This case should not be possible.
            return;
        }
        invokeLoadingIndicator();

        const update: Partial<UserPreferences> = {
            webClient: {
                ...userPreferences.webClient,
                themes: {
                    light: lightTheme,
                    dark: darkTheme
                }
            }
        };

        try {
            await userService.updateUserPreferences(update);
            resetLoadingIndicator();
            navigate('/user/settings');
        } catch (error: any) {
            // TODO Display error message to user.
            console.error(error);
            resetLoadingIndicator();
        }

    }, [darkTheme, invokeLoadingIndicator, lightTheme, navigate, resetLoadingIndicator, userService]);

    const handleCancelButtonClick = useCallback((): void => {
        navigate('/user/settings');
    }, [navigate]);

    /**
     * FabContainer children
     */
    const fabContainerChildNodes: ReactNode = [
        <Tooltip key='cancel' title='Cancel'>
            <div>
                <Fab
                    color='default'
                    onClick={handleCancelButtonClick}
                    disabled={isLoadingIndicatorActive}
                    children={<ClearIcon />}
                />
            </div>
        </Tooltip>,
        <Tooltip key='save' title='Save'>
            <div>
                <Fab
                    color='primary'
                    onClick={handleSaveButtonClick}
                    disabled={isLoadingIndicatorActive}
                    children={<SaveIcon />}
                />
            </div>
        </Tooltip>
    ];

    return (
        <Fragment>
            <AppBarElevateOnScroll>
                <PageTitle>Edit Themes</PageTitle>
                <UserThemeEdit userTheme={lightTheme} forThemeMode='light' />
                <UserThemeEdit userTheme={darkTheme} forThemeMode='dark' />
            </AppBarElevateOnScroll>
            <FabContainer children={fabContainerChildNodes} />
        </Fragment>
    );
});

import { Clear as ClearIcon, Save as SaveIcon } from '@mui/icons-material';
import { Fab, Tooltip } from '@mui/material';
import _ from 'lodash';
import React, { Fragment, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPreferences, UserWebClientTheme } from '../../../../../local_modules/types/lib';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { LayoutPageScrollable } from '../../../../components/layout/layout-page-scrollable.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useElevateAppBarOnScroll } from '../../../../hooks/user-interface/use-elevate-app-bar-on-scroll.hook';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { UserService } from '../../../../services/data/user/user.service';
import { LoadingIndicatorOverlayService } from '../../../../services/user-interface/loading-indicator-overlay.service';
import { ThemeMode, ThemeService } from '../../../../services/user-interface/theme.service';
import { Nullable } from '../../../../types/internal';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { UserThemeEdit } from './user-theme-edit.component';

const getUserThemeOrDefault = (userPreferences: Nullable<UserPreferences>, themeMode: ThemeMode): UserWebClientTheme => {
    const userTheme = userPreferences?.webClient.themes[themeMode];
    if (!userTheme) {
        return ThemeService.getDefaultUserWebClientTheme(themeMode);
    } else {
        return _.cloneDeep(userTheme); // Return a clone for editing
    }
};

export const UserThemesEditRoute = React.memo(() => {

    const forceUpdate = useForceUpdate();
    const navigate = useNavigate();

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
    const loadingIndicatorIdRef = useRef<string>();
    const scrollContainerRef = useElevateAppBarOnScroll();

    const resetLoadingIndicator = useCallback((): void => {
        const loadingIndicatorId = loadingIndicatorIdRef.current;
        if (loadingIndicatorId) {
            LoadingIndicatorOverlayService.waive(loadingIndicatorId);
            loadingIndicatorIdRef.current = undefined;
            forceUpdate();
        }
    }, [forceUpdate]);

    useEffect(() => {
        const onCurrentUserPreferencesChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.UserCurrentUserPreferencesChange)
            .subscribe(userPreferences => {
                userPreferencesRef.current = userPreferences;
                setLightTheme(getUserThemeOrDefault(userPreferences, 'light'));
                setDarkTheme(getUserThemeOrDefault(userPreferences, 'dark'));
            });

        return () => onCurrentUserPreferencesChangeSubscription.unsubscribe();
    }, []);

    const handleSaveButtonClick = useCallback(async (): Promise<void> => {
        const userPreferences = userPreferencesRef.current;
        if (!userPreferences) {
            // This case should not be possible.
            return;
        }

        let loadingIndicatorId = loadingIndicatorIdRef.current;
        if (!loadingIndicatorId) {
            loadingIndicatorId = LoadingIndicatorOverlayService.invoke();
        }
        loadingIndicatorIdRef.current = loadingIndicatorId;

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

    }, [darkTheme, lightTheme, navigate, resetLoadingIndicator, userService]);

    const handleCancelButtonClick = useCallback((): void => {
        navigate('/user/settings');
    }, [navigate]);

    /**
     * FabContainer children
     */
    const fabContainerChildNodes: ReactNode = useMemo(() => {
        return [
            <Tooltip key="cancel" title="Cancel">
                <div>
                    <Fab
                        color="default"
                        onClick={handleCancelButtonClick}
                        disabled={!!loadingIndicatorIdRef.current}
                        children={<ClearIcon />}
                    />
                </div>
            </Tooltip>,
            <Tooltip key="save" title="Save">
                <div>
                    <Fab
                        color="primary"
                        onClick={handleSaveButtonClick}
                        disabled={!!loadingIndicatorIdRef.current}
                        children={<SaveIcon />}
                    />
                </div>
            </Tooltip>
        ];
    }, [handleCancelButtonClick, handleSaveButtonClick]);

    return (
        <Fragment>
            <LayoutPageScrollable scrollContainerRef={scrollContainerRef}>
                <PageTitle>Edit Themes</PageTitle>
                <UserThemeEdit userTheme={lightTheme} forThemeMode="light" />
                <UserThemeEdit userTheme={darkTheme} forThemeMode="dark" />
            </LayoutPageScrollable>
            <FabContainer children={fabContainerChildNodes} />
        </Fragment>
    );
});

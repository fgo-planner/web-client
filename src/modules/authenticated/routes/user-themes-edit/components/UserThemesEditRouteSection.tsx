import { UserWebClientTheme } from '@fgo-planner/data-core';
import { Button } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { LayoutContentSection } from '../../../../../components/layout/LayoutContentSection';
import { SectionTitle } from '../../../../../components/text/SectionTitle';
import { useInjectable } from '../../../../../hooks/dependency-injection/useInjectable';
import { useForceUpdate } from '../../../../../hooks/utils/useForceUpdate';
import { ThemeService } from '../../../../../services/user-interface/ThemeService';
import { ThemeMode } from '../../../../../types';
import { UserThemesEditRouteBackgroundImage } from './UserThemesEditRouteBackgroundImage';
import { UserThemesEditRouteColor } from './UserThemesEditRouteColor';

type Props = {
    userTheme?: UserWebClientTheme;
    forThemeMode: ThemeMode;
};

export const UserThemesEditRouteSection = React.memo((props: Props) => {

    const forceUpdate = useForceUpdate();

    const themeService = useInjectable(ThemeService);

    const {
        userTheme,
        forThemeMode
    } = props;

    const title = useMemo(() => {
        return forThemeMode.charAt(0).toUpperCase() + forThemeMode.substring(1) + ' Theme';
    }, [forThemeMode]);

    const handleResetDefaultClick = useCallback((): void => {
        const defaultTheme = themeService.getDefaultUserWebClientTheme(forThemeMode);
        Object.assign(userTheme!!, defaultTheme);
        forceUpdate();
    }, [forThemeMode, forceUpdate, themeService, userTheme]);

    const handleBackgroundImageUrlChange = useCallback((url: string): void => {
        userTheme!!.backgroundImageUrl = url;
        forceUpdate();
    }, [userTheme, forceUpdate]);

    if (!userTheme) {
        return null;
    }

    return (
        <LayoutContentSection className='m-4'>
            <SectionTitle>
                {title}
            </SectionTitle>
            <div className='flex'>
                <div style={{ flex: 0.5 }}>
                    <UserThemesEditRouteColor
                        color={userTheme.backgroundColor}
                        label='Background'
                        allowEditAlpha
                    />
                    <UserThemesEditRouteColor
                        color={userTheme.foregroundColor}
                        label='Foreground'
                    />
                    <UserThemesEditRouteColor
                        color={userTheme.drawerColor}
                        label='Drawer'
                    />
                    <UserThemesEditRouteColor
                        color={userTheme.primaryColor}
                        label='Primary'
                    />
                    <UserThemesEditRouteColor
                        color={userTheme.secondaryColor}
                        label='Secondary'
                    />
                    <UserThemesEditRouteColor
                        color={userTheme.dividerColor}
                        label='Divider'
                        allowEditAlpha
                    />
                </div>
                <div style={{ flex: 0.5 }}>
                    <UserThemesEditRouteBackgroundImage
                        url={userTheme.backgroundImageUrl}
                        onChange={handleBackgroundImageUrlChange}
                    />
                </div>
            </div>
            <div className='p-6'>
                <Button variant='contained' color='secondary' onClick={handleResetDefaultClick}>
                    Reset to Default
                </Button>
            </div>
        </LayoutContentSection>
    );

});

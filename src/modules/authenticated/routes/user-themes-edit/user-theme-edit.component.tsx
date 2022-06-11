import { Button } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { UserWebClientTheme } from '../../../../../local_modules/types/lib';
import { LayoutContentSection } from '../../../../components/layout/layout-content-section.component';
import { SectionTitle } from '../../../../components/text/section-title.component';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { ThemeService } from '../../../../services/user-interface/theme.service';
import { ThemeMode } from '../../../../types/internal';
import { UserThemeBackgroundImage } from './user-theme-background-image.component';
import { UserThemeColor } from './user-theme-color.component';

type Props = {
    userTheme?: UserWebClientTheme;
    forThemeMode: ThemeMode;
};

export const UserThemeEdit = React.memo(({ userTheme, forThemeMode }: Props) => {

    const forceUpdate = useForceUpdate();

    const themeService = useInjectable(ThemeService);

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
                    <UserThemeColor
                        color={userTheme.backgroundColor}
                        label='Background'
                        allowEditAlpha
                    />
                    <UserThemeColor
                        color={userTheme.foregroundColor}
                        label='Foreground'
                        allowEditAlpha
                    />
                    <UserThemeColor
                        color={userTheme.drawerColor}
                        label='Drawer'
                    />
                    <UserThemeColor
                        color={userTheme.primaryColor}
                        label='Primary'
                    />
                    <UserThemeColor
                        color={userTheme.secondaryColor}
                        label='Secondary'
                    />
                    <UserThemeColor
                        color={userTheme.dividerColor}
                        label='Divider'
                        allowEditAlpha
                    />
                </div>
                <div style={{ flex: 0.5 }}>
                    <UserThemeBackgroundImage
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

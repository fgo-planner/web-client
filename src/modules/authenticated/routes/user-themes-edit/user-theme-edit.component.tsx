import { Button } from '@material-ui/core';
import React, { useMemo } from 'react';
import { useCallback } from 'react';
import { UserWebClientTheme } from '../../../../../local_modules/types/lib';
import { LayoutPanelContainer } from '../../../../components/layout/layout-panel-container.component';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { ThemeMode, ThemeService } from '../../../../services/user-interface/theme.service';
import { UserThemeColor } from './user-theme-color.component';

type Props = {
    userTheme?: UserWebClientTheme;
    forThemeMode: ThemeMode;
};

export const UserThemeEdit = React.memo(({ userTheme, forThemeMode }: Props) => {

    const forceUpdate = useForceUpdate();

    const title = useMemo(() => {
        return forThemeMode.charAt(0).toUpperCase() + forThemeMode.substr(1) + ' Theme';
    }, [forThemeMode]);

    const handleResetDefaultClick = useCallback((): void => {
        const defaultTheme = ThemeService.getDefaultUserWebClientTheme(forThemeMode);
        Object.assign(userTheme, defaultTheme);
        forceUpdate();
    }, [forThemeMode, userTheme, forceUpdate]);

    if (!userTheme) {
        return null;
    }

    return (
        <LayoutPanelContainer className="m-4" title={title} titlePosition="inside">
            <div className="flex">
                <div style={{ flex: 0.5 }}>
                    <UserThemeColor color={userTheme.backgroundColor} label="Background" allowEditAlpha />
                    <UserThemeColor color={userTheme.foregroundColor} label="Foreground" allowEditAlpha />
                    <UserThemeColor color={userTheme.primaryColor} label="Primary" />
                    <UserThemeColor color={userTheme.secondaryColor} label="Secondary" />
                    <UserThemeColor color={userTheme.dividerColor} label="Divider" allowEditAlpha />
                </div>
                <div style={{ flex: 0.5 }}>
                    Background Image
                </div>
            </div>
            <div className="p-6">
                <Button variant="contained" color="secondary" onClick={handleResetDefaultClick}>
                    Reset to Default
                </Button>
            </div>
        </LayoutPanelContainer>
    );

});

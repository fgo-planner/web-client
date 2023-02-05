import { ButtonProps, Theme, useMediaQuery } from '@mui/material';
import { DialogComponentProps } from '../../types';

const DefaultActionButtonVariant = 'text';

const DefaultFullscreenActionButtonVariant = 'contained';

const isCloseIconEnabled = (fullScreen: boolean, showCloseIcon: DialogComponentProps['showCloseIcon']): boolean => {
    if (showCloseIcon === 'always') {
        return true;
    } else if (showCloseIcon === 'never') {
        return false;
    }
    return fullScreen;
};

const getActionButtonVariant = (fullScreen: boolean): ButtonProps['variant'] => {
    return fullScreen ? DefaultFullscreenActionButtonVariant : DefaultActionButtonVariant;
};

export const useAutoResizeDialog = (props: Pick<DialogComponentProps<any>, 'fullScreen' | 'showCloseIcon'>) => {
    const isXs = useMediaQuery((theme: Theme) => theme.breakpoints.only('xs'));
    /**
     * If the `fullScreen` property was provided as a prop, then use its value.
     * Otherwise, compute the value based on whether the screen width is within the
     * `xs` breakpoint.
     */
    let fullScreen = props.fullScreen;
    if (fullScreen === undefined) {
        fullScreen = isXs;
    }
    const closeIconEnabled = isCloseIconEnabled(fullScreen, props.showCloseIcon);
    const actionButtonVariant = getActionButtonVariant(fullScreen);
    return { fullScreen, closeIconEnabled, actionButtonVariant };
};

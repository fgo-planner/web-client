import { useCallback, useState } from 'react';

export type DefaultDialog = {
    name: undefined;
};

export type ActiveDialog<NAMES extends string> = {
    name: NAMES;
    data?: any;
};

export type DialogStateHookResult<NAMES extends string, T extends ActiveDialog<NAMES>> = {

    activeDialog: Readonly<DefaultDialog | T>;

    closeActiveDialog(): void;

    openDialog(data: DefaultDialog | T): void;

};

// eslint-disable-next-line @typescript-eslint/no-redeclare
const DefaultDialog = {
    name: undefined
} as const;

/**
 * Utility hook for managing dialogs in a route. This intended to be used at the
 * route component level. Each instance hook will only allow at most one managed
 * dialog to be open at a time.
 */
export function useDialogState<NAMES extends string, T extends ActiveDialog<NAMES>>(): DialogStateHookResult<NAMES, T> {

    const [activeDialog, setActiveDialog] = useState<Readonly<DefaultDialog | T>>(DefaultDialog);

    const closeActiveDialog = useCallback((): void => {
        setActiveDialog(prevOpenDialog => {
            if (prevOpenDialog.name === undefined) {
                return prevOpenDialog;
            }
            return DefaultDialog;
        });
    }, []);

    return {
        activeDialog,
        closeActiveDialog,
        openDialog: setActiveDialog
    }; 

};
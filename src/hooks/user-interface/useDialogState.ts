import { useCallback, useState } from 'react';

export type DefaultDialogInfo = {
    name: undefined;
};

export type ActiveDialogInfo<NAMES extends string> = {
    name: NAMES;
    data?: any;
};

export type DialogStateHookResult<NAMES extends string, T extends ActiveDialogInfo<NAMES>> = {

    activeDialogInfo: Readonly<DefaultDialogInfo | T>;

    closeActiveDialog(): void;

    openDialog(data: DefaultDialogInfo | T): void;

};

// eslint-disable-next-line @typescript-eslint/no-redeclare
const DefaultDialogInfo = {
    name: undefined
} as const;

/**
 * Utility hook for managing dialogs in a route. This intended to be used at the
 * route component level. Each instance hook will only allow at most one managed
 * dialog to be open at a time.
 */
export function useDialogState<NAMES extends string, T extends ActiveDialogInfo<NAMES>>(): DialogStateHookResult<NAMES, T> {

    type DialogInfo = Readonly<DefaultDialogInfo | T>;

    const [activeDialogInfo, setActiveDialogInfo] = useState<DialogInfo>(DefaultDialogInfo);

    const closeActiveDialog = useCallback((): void => {
        setActiveDialogInfo(prevOpenDialogInfo => {
            if (prevOpenDialogInfo.name === undefined) {
                return prevOpenDialogInfo;
            }
            return DefaultDialogInfo;
        });
    }, []);

    return {
        activeDialogInfo,
        closeActiveDialog,
        openDialog: setActiveDialogInfo
    }; 

};
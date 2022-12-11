import { MasterServantAggregatedData } from '@fgo-planner/data-core';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { PromptDialog } from '../../../../../components/dialog/prompt-dialog.component';
import { DialogComponentProps, ModalOnCloseReason } from '../../../../../types';
import { GameServantUtils } from '../../../../../utils/game/game-servant.utils';

export type MasterServantsRouteDeleteDialogData = {
    /**
     * Array containing the source `MasterServantAggregatedData` objects for the
     * servants being deleted.
     */
    targetMasterServantsData: ReadonlyArray<MasterServantAggregatedData>;
};

type Props = {
    /**
     * If this is `undefined` or has a length of 0, then the dialog will remain
     * closed.
     */
    dialogData?: MasterServantsRouteDeleteDialogData;
} & Omit<DialogComponentProps<MasterServantsRouteDeleteDialogData>, 'open' | 'keepMounted' | 'onExited' | 'PaperProps'>;

export const MasterServantsRouteDeleteDialog = React.memo((props: Props) => {

    const {
        dialogData,
        onClose,
        ...dialogProps
    } = props;

    const [title, setTitle] = useState<string>();

    const [prompt, setPrompt] = useState<ReactNode>();

    const targetMasterServantsData = dialogData?.targetMasterServantsData;

    const open = !!targetMasterServantsData?.length;

    const handleDialogClose = useCallback((event: any, reason: ModalOnCloseReason): void => {
        if (reason === 'submit') {
            onClose(event, reason, dialogData);
        } else {
            onClose(event, reason);
        }
    }, [dialogData, onClose]);

    /**
     * Recomputes the dialog title and prompt when the props change.
     */
    useEffect(() => {
        /**
         * Only recompute the dialog title and prompt if the dialog is open to avoid
         * unnecessary computation when the dialog is not being displayed.
         */
        if (!open) {
            return;
        }
        const hasMultipleTargets = targetMasterServantsData.length > 1;
        const title = `Delete ${hasMultipleTargets ? 'Servants' : 'Servant'}?`;
        const prompt = <>
            <p>The following servant{hasMultipleTargets && 's'} will be deleted:</p>
            <ul>
                {targetMasterServantsData.map(servantData => {
                    const displayedName = GameServantUtils.getDisplayedName(servantData.gameServant);
                    return (
                        <li key={servantData.instanceId}>
                            {displayedName}
                        </li>
                    );
                })}
            </ul>
            <p>Are you sure you want to proceed?</p>
        </>;
        setTitle(title);
        setPrompt(prompt);
    }, [open, targetMasterServantsData]);

    return (
        <PromptDialog
            {...dialogProps}
            open={open}
            keepMounted={false}
            onClose={handleDialogClose}
            title={title}
            prompt={prompt}
            cancelButtonColor='secondary'
            confirmButtonColor='primary'
            confirmButtonLabel='Remove'
        />
    );

});

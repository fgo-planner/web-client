import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { PromptDialog } from '../../../../../components/dialog/prompt-dialog.component';
import { DialogComponentProps, ModalOnCloseReason, PlanServantAggregatedData } from '../../../../../types';
import { GameServantUtils } from '../../../../../utils/game/game-servant.utils';

export type PlanRoutePlanServantDeleteDialogData = {
    /**
     * Array containing the source `PlanServantAggregatedData` objects for the
     * servants being deleted.
     */
    targetPlanServantsData: ReadonlyArray<PlanServantAggregatedData>;
};

type Props = {
    /**
     * If this is `undefined` or has a length of 0, then the dialog will remain
     * closed.
     */
    dialogData?: PlanRoutePlanServantDeleteDialogData;
} & Omit<DialogComponentProps<PlanRoutePlanServantDeleteDialogData>, 'open' | 'keepMounted' | 'onExited' | 'PaperProps'>;

export const PlanRoutePlanServantDeleteDialog = React.memo((props: Props) => {

    const {
        dialogData,
        onClose,
        ...dialogProps
    } = props;

    const [title, setTitle] = useState<string>();

    const [prompt, setPrompt] = useState<ReactNode>();

    const targetPlanServantsData = dialogData?.targetPlanServantsData;

    const open = !!targetPlanServantsData?.length;

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
        const hasMultipleTargets = targetPlanServantsData.length > 1;
        const title = `Remove ${hasMultipleTargets ? 'Servants' : 'Servant'}?`;
        const prompt = <>
            <p>The following servant{hasMultipleTargets && 's'} will be removed from the plan:</p>
            <ul>
                {targetPlanServantsData.map(servantData => {
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
    }, [open, targetPlanServantsData]);

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

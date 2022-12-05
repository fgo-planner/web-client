import React, { ReactNode, useEffect, useState } from 'react';
import { PromptDialog } from '../../../../../components/dialog/prompt-dialog.component';
import { DialogComponentProps, PlanServantAggregatedData } from '../../../../../types';
import { GameServantUtils } from '../../../../../utils/game/game-servant.utils';

type Props = {
    open: boolean;
    /**
     * Array containing the source `PlanServantAggregatedData` objects for the
     * servants being deleted.
     */
    targetPlanServantsData: ReadonlyArray<PlanServantAggregatedData>;
} & Omit<DialogComponentProps, 'open' | 'keepMounted' | 'onExited' | 'PaperProps'>;;

export const PlanRoutePlanServantDeleteDialog = React.memo((props: Props) => {

    const {
        open: openProp,
        targetPlanServantsData,
        ...dialogProps
    } = props;

    const [title, setTitle] = useState<string>();

    const [prompt, setPrompt] = useState<ReactNode>();

    const open = openProp && !!targetPlanServantsData.length;

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
            title={title}
            prompt={prompt}
            cancelButtonColor='secondary'
            confirmButtonColor='primary'
            confirmButtonLabel='Remove'
        />
    );

});

import { ImmutableArray } from '@fgo-planner/common-core';
import { ImmutableMasterServant, PlanServant } from '@fgo-planner/data-core';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, PaperProps, Typography } from '@mui/material';
import React, { MouseEvent, useCallback, useRef } from 'react';
import { DialogCloseButton } from '../../../../../../components/dialog/dialog-close-button.component';
import { useAutoResizeDialog } from '../../../../../../hooks/user-interface/use-auto-resize-dialog.hook';
import { DialogComponentProps } from '../../../../../../types/internal';
import { PlanServantEdit } from './plan-servant-edit.component';

export type DialogData = {
    planServant: PlanServant;
};

type Props = {
    dialogTitle?: string;
    masterServants: ReadonlyArray<ImmutableMasterServant>;
    /**
     * The planned servant to edit. This will be modified directly, so provide a
     * clone if modification to the original object is not desired.
     * 
     * If this is not provided, then the dialog will remain closed.
     */
    planServant?: PlanServant;
    planServants: ImmutableArray<PlanServant>;
    servantSelectDisabled?: boolean;
    showAppendSkills?: boolean;
    submitButtonLabel?: string;
    unlockedCostumes: ReadonlyArray<number>;
} & Omit<DialogComponentProps<DialogData>, 'open' | 'keepMounted' | 'onExited' | 'PaperProps'>;

const DialogWidth = 640;

const DialogPaperProps = {
    style: {
        width: DialogWidth,
        maxWidth: DialogWidth,
        margin: 0
    }
} as PaperProps;

export const PlanServantEditDialog = React.memo((props: Props) => {

    const {
        dialogTitle,
        masterServants,
        planServant,
        planServants,
        servantSelectDisabled,
        showAppendSkills,
        submitButtonLabel,
        unlockedCostumes,
        onClose,
        ...dialogProps
    } = props;

    /**
     * Contains cache of the dialog contents.
     */
    const dialogChildRef = useRef<JSX.Element>();

    const {
        fullScreen,
        closeIconEnabled,
        actionButtonVariant
    } = useAutoResizeDialog(props);

    const handleSubmitButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        planServant && onClose(event, 'submit', { planServant });
    }, [onClose, planServant]);

    const handleCancelButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        onClose(event, 'cancel');
    }, [onClose]);

    const open = !!planServant;

    /*
     * Only re-render the dialog child node if the dialog is open. This allows the
     * dialog to keep displaying the same contents while it is undergoing its exit
     * transition, even if the props were changed by the parent component.
     */
    if (open || !dialogChildRef.current) {
        dialogChildRef.current = (
            <Typography component={'div'}>
                <DialogTitle>
                    {dialogTitle}
                    {closeIconEnabled && <DialogCloseButton onClick={handleCancelButtonClick} />}
                </DialogTitle>
                <DialogContent>
                    <PlanServantEdit
                        masterServants={masterServants}
                        planServant={planServant!}
                        planServants={planServants}
                        showAppendSkills={showAppendSkills}
                        unlockedCostumes={unlockedCostumes}
                        servantSelectDisabled={servantSelectDisabled}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        variant={actionButtonVariant}
                        color='secondary'
                        onClick={handleCancelButtonClick}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={actionButtonVariant}
                        color='primary'
                        onClick={handleSubmitButtonClick}
                    >
                        {submitButtonLabel || 'Submit'}
                    </Button>
                </DialogActions>
            </Typography>
        );
    }

    return (
        <Dialog
            {...dialogProps}
            PaperProps={DialogPaperProps}
            open={open}
            fullScreen={fullScreen}
            keepMounted={false}
        >
            {dialogChildRef.current}
        </Dialog>
    );

});

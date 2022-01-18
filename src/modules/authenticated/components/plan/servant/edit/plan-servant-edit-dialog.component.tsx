import { MasterServant, PlanServant } from '@fgo-planner/types';
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
    masterServants: ReadonlyArray<MasterServant>;
    /**
     * The planned servant to edit. This will be modified directly, so provide a
     * clone if modification to the original object is not desired.
     * 
     * If this is not provided, then the dialog will remain closed.
     */
    planServant?: PlanServant;
    planServants: ReadonlyArray<PlanServant>;
    showAppendSkills?: boolean;
    submitButtonLabel?: string;
    unlockedCostumes: Array<number>;
} & Omit<DialogComponentProps<DialogData>, 'keepMounted' | 'onExited' | 'PaperProps'>;

const DialogWidth = 600;

const DialogPaperProps = {
    style: {
        width: DialogWidth
    }
} as PaperProps;

export const PlanServantEditDialog = React.memo((props: Props) => {

    const {
        dialogTitle,
        masterServants,
        planServant,
        planServants,
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

    const submit = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        planServant && onClose(event, 'submit', { planServant });
    }, [onClose, planServant]);

    const cancel = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        onClose(event, 'cancel');
    }, [onClose]);

    const open = props.open && !!planServant;

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
                    {closeIconEnabled && <DialogCloseButton onClick={cancel} />}
                </DialogTitle>
                <DialogContent>
                    <PlanServantEdit
                        masterServants={masterServants}
                        planServant={planServant!}
                        planServants={planServants}
                        showAppendSkills={showAppendSkills}
                        unlockedCostumes={unlockedCostumes}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        variant={actionButtonVariant}
                        color='secondary'
                        onClick={cancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={actionButtonVariant}
                        color='primary'
                        onClick={submit}
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

import { ImmutableArray } from '@fgo-planner/common-core';
import { ImmutableMasterServant, PlanServant, PlanServantUpdate } from '@fgo-planner/data-core';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, PaperProps, Typography } from '@mui/material';
import React, { MouseEvent, useCallback, useRef } from 'react';
import { DialogCloseButton } from '../../../../../../components/dialog/dialog-close-button.component';
import { useAutoResizeDialog } from '../../../../../../hooks/user-interface/use-auto-resize-dialog.hook';
import { DialogComponentProps } from '../../../../../../types';

export type PlanServantEditDialogData = {
    action: 'add' | 'edit';
    update: PlanServantUpdate;
};

type Props = {
    action: 'add' | 'edit';
    masterServants: ReadonlyArray<ImmutableMasterServant>;
    /**
     * The update payload for editing. This object will be modified directly.
     *
     * If this is `undefined`, then the dialog will remain closed.
     */
    planServantUpdate?: PlanServantUpdate;
    targetCostumes: ReadonlyArray<number>;
    /**
     * Array containing the `PlanServant` objects being edited.
     *
     * If dialog is inactive (`masterServants` is `undefined`), this should be set
     * to an empty array to avoid unnecessary re-renders while the dialog is closed.
     */
    targetPlanServants: ImmutableArray<PlanServant>;
} & Omit<DialogComponentProps<PlanServantEditDialogData>, 'open' | 'keepMounted' | 'onExited' | 'PaperProps'>;

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
        action,
        masterServants,
        planServantUpdate,
        targetCostumes,
        targetPlanServants,
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
        if (!planServantUpdate) {
            return;
        }
        const data: PlanServantEditDialogData = { 
            action,
            update: planServantUpdate 
        };
        onClose(event, 'submit', data);
    }, [action, onClose, planServantUpdate]);

    const handleCancelButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        onClose(event, 'cancel');
    }, [onClose]);

    const open = !!planServantUpdate;

    /*
     * Only re-render the dialog child node if the dialog is open. This allows the
     * dialog to keep displaying the same contents while it is undergoing its exit
     * transition, even if the props were changed by the parent component.
     */
    if (open || !dialogChildRef.current) {
        dialogChildRef.current = (
            <Typography component={'div'}>
                <DialogTitle>
                    {`${action === 'add' ? 'Add' : 'Edit'} Servant`}
                    {closeIconEnabled && <DialogCloseButton onClick={handleCancelButtonClick} />}
                </DialogTitle>
                <DialogContent>
                    {/* <PlanServantEdit
                        masterServants={masterServants}
                        planServant={planServant!}
                        planServants={planServants}
                        showAppendSkills={showAppendSkills}
                        targetCostumes={targetCostumes}
                        servantSelectDisabled={servantSelectDisabled}
                    /> */}
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
                        Done
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

import { Button, Dialog, DialogActions, DialogTitle, PaperProps, Typography } from '@mui/material';
import React, { MouseEvent, useCallback, useRef } from 'react';
import { DialogCloseButton } from '../../../../../components/dialog/dialog-close-button.component';
import { useAutoResizeDialog } from '../../../../../hooks/user-interface/use-auto-resize-dialog.hook';
import { DialogComponentProps, EditDialogAction, MasterServantAggregatedData, PlanServantAggregatedData } from '../../../../../types';
import { PlanServantEditDialogContent, PlanServantEditTab } from './PlanServantEditDialogContent';
import { PlanServantEditDialogData } from './PlanServantEditDialogData.type';

type Props = {
    activeTab: PlanServantEditTab;
    /**
     * The master servants that are available to be added to the plan.
     *
     * Only used in add mode; this is ignored in edit mode.
     */
    availableServants: ReadonlyArray<MasterServantAggregatedData>;
    /**
     * DTO containing the dialog data that will be returned to the parent component
     * on dialog close. This object will be modified directly.
     * 
     * If this is `undefined`, then the dialog will remain closed.
     */
    dialogData?: PlanServantEditDialogData;
    onTabChange: (tab: PlanServantEditTab) => void;
    /**
     * Array containing the source `PlanServantAggregatedData` objects for the
     * servants being edited.
     *
     * Only used in edit mode; this is ignored in add mode.
     * 
     * If dialog is inactive (`planServantUpdate` is `undefined`), this should be
     * set to an empty array to avoid unnecessary re-renders while the dialog is
     * closed.
     */
    targetPlanServantsData: ReadonlyArray<PlanServantAggregatedData>;
} & Omit<DialogComponentProps<PlanServantEditDialogData>, 'open' | 'keepMounted' | 'onExited' | 'PaperProps'>;

const CancelButtonLabel = 'Cancel';
const SubmitButtonLabel = 'Done';

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
        activeTab,
        availableServants,
        dialogData,
        onTabChange,
        targetPlanServantsData,
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
        if (!dialogData) {
            return;
        }
        onClose(event, 'submit', dialogData);
    }, [dialogData, onClose]);

    const handleCancelButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        onClose(event, 'cancel');
    }, [onClose]);

    const handleDialogClose = useCallback((event: any, reason: 'backdropClick' | 'escapeKeyDown'): void => {
        onClose(event, reason);
    }, [onClose]);

    const open = !!dialogData;

    /**
     * Only re-render the dialog child node if the dialog is open. This allows the
     * dialog to keep displaying the same contents while it is undergoing its exit
     * transition, even if the props were changed by the parent component.
     */
    if (open) {
        dialogChildRef.current = (
            <Typography component={'div'}>
                <DialogTitle>
                    {/* TODO Un-hardcode title strings */}
                    {dialogData.action === EditDialogAction.Add ? 'Add Servant to Plan' : 'Edit Servant Targets'}
                    {closeIconEnabled && <DialogCloseButton onClick={handleCancelButtonClick} />}
                </DialogTitle>
                <PlanServantEditDialogContent
                    dialogData={dialogData}
                    availableServants={availableServants}
                    targetPlanServantsData={targetPlanServantsData}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                />
                <DialogActions>
                    <Button
                        variant={actionButtonVariant}
                        color='secondary'
                        onClick={handleCancelButtonClick}
                    >
                        {CancelButtonLabel}
                    </Button>
                    <Button
                        variant={actionButtonVariant}
                        color='primary'
                        onClick={handleSubmitButtonClick}
                    >
                        {SubmitButtonLabel}
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
            onClose={handleDialogClose}
        >
            {dialogChildRef.current}
        </Dialog>
    );

});

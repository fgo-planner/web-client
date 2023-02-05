import { PlanServantAggregatedData } from '@fgo-planner/data-core';
import { Button, Dialog, DialogActions, DialogTitle, PaperProps, Typography } from '@mui/material';
import React, { MouseEvent, useCallback, useRef } from 'react';
import { DialogCloseButton } from '../../../../../components/dialog/DialogCloseButton';
import { useAutoResizeDialog } from '../../../../../hooks/user-interface/useAutoResizeDialog';
import { DialogComponentProps, EditDialogAction } from '../../../../../types';
import { PlanRoutePlanServantEditDialogContent, PlanServantEditTab } from './PlanRoutePlanServantEditDialogContent';
import { PlanRoutePlanServantEditDialogData } from './PlanRoutePlanServantEditDialogData.type';

type Props = {
    activeTab: PlanServantEditTab;
    /**
     * DTO containing the dialog data that will be returned to the parent component
     * on dialog close. Data contained in this object may be modified directly.
     * 
     * If this is `undefined`, then the dialog will remain closed.
     */
    dialogData?: PlanRoutePlanServantEditDialogData;
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
} & Omit<DialogComponentProps<PlanRoutePlanServantEditDialogData>, 'open' | 'keepMounted' | 'onExited' | 'PaperProps'>;

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

export const PlanRoutePlanServantEditDialog = React.memo((props: Props) => {

    const {
        activeTab,
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
        
        let dialogTitle: string;
        // TODO Un-hardcode title strings
        if (dialogData.action === EditDialogAction.Add) {
            dialogTitle = 'Add Servant to Plan';
        } else {
            dialogTitle = 'Edit Servant Targets';
        }

        dialogChildRef.current = (
            <Typography component={'div'}>
                <DialogTitle>
                    {dialogTitle}
                    {closeIconEnabled && <DialogCloseButton onClick={handleCancelButtonClick} />}
                </DialogTitle>
                <PlanRoutePlanServantEditDialogContent
                    dialogData={dialogData}
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

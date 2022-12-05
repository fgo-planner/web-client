import { Button, Dialog, DialogActions, DialogTitle, PaperProps, SxProps, Typography } from '@mui/material';
import { Theme as SystemTheme } from '@mui/system';
import React, { MouseEvent, useCallback, useRef } from 'react';
import { DialogCloseButton } from '../../../../../components/dialog/dialog-close-button.component';
import { useAutoResizeDialog } from '../../../../../hooks/user-interface/use-auto-resize-dialog.hook';
import { ScrollbarStyleProps } from '../../../../../styles/scrollbar-style-props';
import { DialogComponentProps } from '../../../../../types';
import { PlanRoutePlanMasterItemsEditDialogContent } from './PlanRouteMasterItemsEditDialogContent';
import { PlanRouteMasterItemsEditDialogData } from './PlanRouteMasterItemsEditDialogData.type';

type Props = {
    /**
     * DTO containing the dialog data that will be returned to the parent component
     * on dialog close. This object will be modified directly.
     * 
     * If this is `undefined`, then the dialog will remain closed.
     */
    dialogData?: PlanRouteMasterItemsEditDialogData;
} & Omit<DialogComponentProps<PlanRouteMasterItemsEditDialogData>, 'open' | 'keepMounted' | 'onExited' | 'PaperProps'>;

const CancelButtonLabel = 'Cancel';
const SubmitButtonLabel = 'Done';

const DialogWidth = 640;

const DialogPaperStyleProps = [
    ScrollbarStyleProps,
    {
        width: DialogWidth,
        maxWidth: DialogWidth,
        margin: 0,
        '>.MuiTypography-root': {
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }
    }
] as SxProps<SystemTheme>;

const DialogPaperProps = {
    sx: DialogPaperStyleProps
} as PaperProps;

export const PlanRouteMasterItemsEditDialog = React.memo((props: Props) => {

    const {
        dialogData,
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
                    Edit Inventory
                    {closeIconEnabled && <DialogCloseButton onClick={handleCancelButtonClick} />}
                </DialogTitle>
                <PlanRoutePlanMasterItemsEditDialogContent dialogData={dialogData} />
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

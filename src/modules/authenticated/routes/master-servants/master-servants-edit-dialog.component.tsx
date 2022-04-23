import { MasterServantBondLevel } from '@fgo-planner/types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, PaperProps, Typography } from '@mui/material';
import React, { MouseEvent, useCallback, useMemo, useRef } from 'react';
import { DialogCloseButton } from '../../../../components/dialog/dialog-close-button.component';
import { useAutoResizeDialog } from '../../../../hooks/user-interface/use-auto-resize-dialog.hook';
import { DialogComponentProps, ReadonlyRecord } from '../../../../types/internal';
import { MasterServantEditData } from '../../components/master/servant/edit/master-servant-edit-data.type';
import { MasterServantEdit } from '../../components/master/servant/edit/master-servant-edit.component';

type Props = {
    bondLevels: ReadonlyRecord<number, MasterServantBondLevel>;
    /**
     * The servant data to edit. This will be modified directly, so provide a clone
     * if modification to the original object is not desired.
     *
     * If this is `undefined`, then the dialog will remain closed.
     */
    editData?: MasterServantEditData;
    /**
     * Whether multiple servants are being edited. In this mode, various parameters
     * will not be available for edit.
     */
    isMultipleServantsSelected?: boolean;
    showAppendSkills?: boolean;
} & Omit<DialogComponentProps<MasterServantEditData>, 'open' | 'keepMounted' | 'onExited' | 'PaperProps'>;

const CancelButtonLabel = 'Cancel';
const SubmitButtonLabel = 'Done';

const DialogWidth = 600;

const DialogPaperProps = {
    style: {
        width: DialogWidth,
        maxWidth: DialogWidth,
        margin: 0
    }
} as PaperProps;

/**
 * Dialog for adding single master servants, as well as single and bulk editing
 * existing master servants. Specific to the master-servants route.
 */
export const MasterServantsEditDialog = React.memo((props: Props) => {

    const {
        bondLevels,
        editData,
        isMultipleServantsSelected,
        showAppendSkills,
        onClose,
        ...dialogProps
    } = props;

    /**
     * Contains cache of the dialog contents.
     */
    const dialogContentsRef = useRef<JSX.Element>();

    const {
        fullScreen,
        closeIconEnabled,
        actionButtonVariant
    } = useAutoResizeDialog(props);

    const handleSubmitButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        onClose(event, 'submit', editData);
    }, [editData, onClose]);

    const handleCancelButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        onClose(event, 'cancel');
    }, [onClose]);

    const handleDialogClose = useCallback((event: any, reason: 'backdropClick' | 'escapeKeyDown'): void => {
        onClose(event, reason);
    }, [onClose]);

    const dialogTitle = useMemo((): string => {
        if (!editData) {
            return '';
        }
        // TODO Un-hardcode the strings.
        if (editData.isNewServant) {
            return 'Add Servant';
        } else if (isMultipleServantsSelected)  {
            return 'Edit Servants';
        } else {
            return 'Edit Servant';
        }
    }, [editData, isMultipleServantsSelected]);

    const open = !!editData;

    const multiEditMode = isMultipleServantsSelected && !editData?.isNewServant;

    /*
     * Only re-render the dialog contents if the dialog is open. This allows the
     * dialog to keep displaying the same contents while it is undergoing its exit
     * transition, even if the props were changed by the parent component.
     */
    if (open) {
        dialogContentsRef.current = (
            <Typography component={'div'}>
                <DialogTitle>
                    {dialogTitle}
                    {closeIconEnabled && <DialogCloseButton onClick={handleCancelButtonClick} />}
                </DialogTitle>
                <DialogContent>
                    <MasterServantEdit
                        bondLevels={bondLevels}
                        editData={editData!}
                        multiEditMode={multiEditMode}
                        showAppendSkills={showAppendSkills}
                    />
                </DialogContent>
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
            {dialogContentsRef.current}
        </Dialog>
    );

});

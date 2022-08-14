import { MasterServantBondLevel } from '@fgo-planner/types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, PaperProps, Typography } from '@mui/material';
import React, { MouseEvent, useCallback, useMemo, useRef } from 'react';
import { DialogCloseButton } from '../../../../../components/dialog/dialog-close-button.component';
import { useAutoResizeDialog } from '../../../../../hooks/user-interface/use-auto-resize-dialog.hook';
import { DialogComponentProps, MasterServantUpdate, ReadonlyRecord } from '../../../../../types/internal';
import { MasterServantEdit, MasterServantEditTab } from '../../../components/master/servant/edit/master-servant-edit.component';

type Props = {
    activeTab: MasterServantEditTab;
    bondLevels: ReadonlyRecord<number, MasterServantBondLevel>;
    /**
     * Whether multiple servants are being edited. In this mode, various parameters
     * will not be available for edit.
     */
    isMultipleServantsSelected?: boolean;
    /**
     * The update payload for editing. This will be modified directly, so provide a
     * clone if modification to the original object is not desired.
     *
     * If this is `undefined`, then the dialog will remain closed.
     */
    masterServantUpdate?: MasterServantUpdate;
    onTabChange: (tab: MasterServantEditTab) => void;
} & Omit<DialogComponentProps<MasterServantUpdate>, 'open' | 'keepMounted' | 'onExited' | 'PaperProps'>;

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
        activeTab,
        bondLevels,
        isMultipleServantsSelected,
        masterServantUpdate,
        onTabChange,
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
        onClose(event, 'submit', masterServantUpdate);
    }, [onClose, masterServantUpdate]);

    const handleCancelButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        onClose(event, 'cancel');
    }, [onClose]);

    const handleDialogClose = useCallback((event: any, reason: 'backdropClick' | 'escapeKeyDown'): void => {
        onClose(event, reason);
    }, [onClose]);

    const dialogTitle = useMemo((): string => {
        if (!masterServantUpdate) {
            return '';
        }
        // TODO Un-hardcode the strings.
        if (masterServantUpdate.isNewServant) {
            return 'Add Servant';
        } else if (isMultipleServantsSelected)  {
            return 'Edit Servants';
        } else {
            return 'Edit Servant';
        }
    }, [isMultipleServantsSelected, masterServantUpdate]);

    const open = !!masterServantUpdate;

    const multiEditMode = isMultipleServantsSelected && !masterServantUpdate?.isNewServant;

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
                        masterServantUpdate={masterServantUpdate!}
                        multiEditMode={multiEditMode}
                        showAppendSkills
                        activeTab={activeTab}
                        onTabChange={onTabChange}
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

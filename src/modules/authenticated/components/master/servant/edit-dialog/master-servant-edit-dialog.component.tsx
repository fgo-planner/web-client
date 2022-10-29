import { ReadonlyRecord } from '@fgo-planner/common-core';
import { ImmutableMasterServant, MasterServantBondLevel, MasterServantUpdate, NewMasterServantUpdateType } from '@fgo-planner/data-core';
import { Button, Dialog, DialogActions, DialogTitle, PaperProps, SxProps, Typography } from '@mui/material';
import { Theme as SystemTheme } from '@mui/system';
import React, { MouseEvent, useCallback, useMemo, useRef } from 'react';
import { DialogCloseButton } from '../../../../../../components/dialog/dialog-close-button.component';
import { useAutoResizeDialog } from '../../../../../../hooks/user-interface/use-auto-resize-dialog.hook';
import { ScrollbarStyleProps } from '../../../../../../styles/scrollbar-style-props';
import { DialogComponentProps } from '../../../../../../types/internal';
import { MasterServantEditDialogContent, MasterServantEditTab } from './master-servant-edit-dialog-content.component';

type Props = {
    activeTab: MasterServantEditTab;
    bondLevels: ReadonlyRecord<number, MasterServantBondLevel>;
    /**
     * The update payload for editing. This will be modified directly, so provide a
     * clone if modification to the original object is not desired.
     *
     * If this is `undefined`, then the dialog will remain closed.
     */
    masterServantUpdate?: MasterServantUpdate;
    onTabChange: (tab: MasterServantEditTab) => void;
    /**
     * Array containing the `MasterServant` objects being edited.
     *
     * If a single servant is being edited, this array should contain exactly one
     * `MasterServant`, whose `gameId` value matches that of the given
     * `masterServantUpdate`.
     *
     * If multiple servants are being edited, this array should contain all the
     * target `MasterServant`, and `masterServantUpdate.gameId` should be set to the
     * indeterminate value.
     *
     * If inactive (`masterServantUpdate` is `undefined`), this should be set to an
     * empty array to avoid unnecessary re-renders while the dialog is closed.
     */
    targetMasterServants: ReadonlyArray<ImmutableMasterServant>;
} & Omit<DialogComponentProps<MasterServantUpdate>, 'open' | 'keepMounted' | 'onExited' | 'PaperProps'>;

const CancelButtonLabel = 'Cancel';
const SubmitButtonLabel = 'Done';

const DialogWidth = 600;

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

/*
 * Dialog for adding single master servants, as well as single and bulk editing
 * existing master servants.
 */
export const MasterServantEditDialog = React.memo((props: Props) => {

    const {
        activeTab,
        bondLevels,
        masterServantUpdate,
        onTabChange,
        onClose,
        targetMasterServants,
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

    const multiEditMode = targetMasterServants.length > 1;

    const dialogTitle = useMemo((): string => {
        if (!masterServantUpdate) {
            return '';
        }
        // TODO Un-hardcode the strings.
        if (masterServantUpdate.type === NewMasterServantUpdateType) {
            return 'Add Servant';
        } else if (multiEditMode)  {
            return 'Edit Servants';
        } else {
            return 'Edit Servant';
        }
    }, [masterServantUpdate, multiEditMode]);

    const open = !!masterServantUpdate;

    /**
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
                <MasterServantEditDialogContent
                    bondLevels={bondLevels}
                    masterServantUpdate={masterServantUpdate!}
                    targetMasterServants={targetMasterServants}
                    showAppendSkills
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
            {dialogContentsRef.current}
        </Dialog>
    );

});

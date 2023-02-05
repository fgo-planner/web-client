import { MasterServantAggregatedData } from '@fgo-planner/data-core';
import { Button, Dialog, DialogActions, DialogTitle, PaperProps, SxProps, Typography } from '@mui/material';
import { Theme as SystemTheme } from '@mui/system';
import React, { MouseEvent, useCallback, useRef } from 'react';
import { DialogCloseButton } from '../../../../../../components/dialog/DialogCloseButton';
import { useAutoResizeDialog } from '../../../../../../hooks/user-interface/useAutoResizeDialog';
import { ScrollbarStyleProps } from '../../../../../../styles/ScrollbarStyleProps';
import { DialogComponentProps, EditDialogAction } from '../../../../../../types';
import { MasterServantEditDialogContent, MasterServantEditTab } from './MasterServantEditDialogContent';
import { MasterServantEditDialogData } from './MasterServantEditDialogData.type';

type Props = {
    activeTab: MasterServantEditTab;
    /**
     * DTO containing the dialog data that will be returned to the parent component
     * on dialog close. Data contained in this object may be modified directly.
     * 
     * If this is `undefined`, then the dialog will remain closed.
     */
    dialogData?: MasterServantEditDialogData;
    onTabChange: (tab: MasterServantEditTab) => void;
    /**
     * Array containing the source `MasterServantAggregatedData` objects for the
     * servants being edited.
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
     * 
     * Only used in edit mode; this is ignored in add mode.
     */
    targetMasterServantsData: ReadonlyArray<MasterServantAggregatedData>;
} & Omit<DialogComponentProps<MasterServantEditDialogData>, 'open' | 'keepMounted' | 'onExited' | 'PaperProps'>;

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
        dialogData,
        onTabChange,
        onClose,
        targetMasterServantsData,
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
     * Only re-render the dialog contents if the dialog is open. This allows the
     * dialog to keep displaying the same contents while it is undergoing its exit
     * transition, even if the props were changed by the parent component.
     */
    if (open) {

        let dialogTitle: string;
        // TODO Un-hardcode title strings
        if (dialogData.action === EditDialogAction.Add) {
            dialogTitle = 'Add Servant';
        } else if (targetMasterServantsData.length > 1)  {
            dialogTitle = 'Edit Servants';
        } else {
            dialogTitle = 'Edit Servant';
        }

        dialogContentsRef.current = (
            <Typography component={'div'}>
                <DialogTitle>
                    {dialogTitle}
                    {closeIconEnabled && <DialogCloseButton onClick={handleCancelButtonClick} />}
                </DialogTitle>
                <MasterServantEditDialogContent
                    dialogData={dialogData}
                    targetMasterServantsData={targetMasterServantsData}
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

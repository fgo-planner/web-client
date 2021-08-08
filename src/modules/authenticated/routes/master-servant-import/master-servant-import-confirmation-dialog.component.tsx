import { Button, ButtonProps, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel } from '@material-ui/core';
import React, { ChangeEvent, MouseEvent, useCallback } from 'react';
import { useState } from 'react';
import { DialogCloseButton } from '../../../../components/dialog/dialog-close-button.component';
import { useAutoResizeDialog } from '../../../../hooks/user-interface/use-auto-resize-dialog.hook';
import { DialogComponentProps } from '../../../../types/internal';

type RenderedProps = {
    cancelButtonColor?: ButtonProps['color'];
    confirmButtonColor?: ButtonProps['color'];
};

type Props = RenderedProps & Omit<DialogComponentProps<boolean>, 'onExited'>;

const Prompt1 = 'There are existing servants on this account. By default, the imported servants will be appended to the existing servants.';
const Prompt2 = 'Check the box below to overwrite the existing servants instead (all of the existing servants will be removed).';

export const MasterServantImportConfirmationDialog = React.memo((props: Props) => {

    const {
        cancelButtonColor,
        confirmButtonColor,
        onClose,
        ...dialogProps
    } = props;

    const {
        fullScreen,
        closeIconEnabled,
        actionButtonVariant
    } = useAutoResizeDialog(props);

    const [importOverwriteOption, setImportOverwriteOption] = useState<'append' | 'overwrite'>('append');

    const handleImportOverwriteOptionChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        setImportOverwriteOption(event.target.checked ? 'overwrite' : 'append');
    }, []);

    const handleCloseButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        onClose(event, 'cancel');
    }, [onClose]);

    const handleSubmitButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        onClose(event, 'submit', importOverwriteOption === 'overwrite');
    }, [importOverwriteOption, onClose]);

    return (
        <Dialog {...dialogProps} fullScreen={fullScreen} onClose={onClose}>
            <DialogTitle>
                {closeIconEnabled && <DialogCloseButton onClick={handleCloseButtonClick} />}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>{Prompt1} {Prompt2}</DialogContentText>
                <FormControlLabel
                    control={
                        <Checkbox
                            name="importOverwriteOption"
                            checked={importOverwriteOption === 'overwrite'}
                            onChange={handleImportOverwriteOptionChange}
                        />
                    }
                    label="Overwrite existing servants"
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant={actionButtonVariant}
                    color={cancelButtonColor}
                    onClick={handleCloseButtonClick}
                >
                    Cancel
                </Button>
                <Button
                    variant={actionButtonVariant}
                    color={confirmButtonColor}
                    onClick={handleSubmitButtonClick}
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );

});

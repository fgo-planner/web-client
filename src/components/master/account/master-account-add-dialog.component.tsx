import { MasterAccount } from '@fgo-planner/data-core';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { ChangeEvent, FormEvent, useCallback, useRef, useState } from 'react';
import { useAutoResizeDialog } from '../../../hooks/user-interface/use-auto-resize-dialog.hook';
import { DialogComponentProps } from '../../../types/internal';
import { DialogCloseButton } from '../../dialog/dialog-close-button.component';
import { InputFieldContainer } from '../../input/input-field-container.component';

type Props = {
    errorMessage?: string;
} & DialogComponentProps<Partial<MasterAccount>>;

type Form = {
    name: string;
    friendId: string;
};

const FormId = 'master-account-form';

const defaultFormValues = (): Form => {
    return {
        name: '',
        friendId: ''
    };
};

export const MasterAccountAddDialog = React.memo((props: Props) => {

    const {
        errorMessage,
        onClose
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

    const [formValues, setFormValues] = useState<Form>(defaultFormValues());

    const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target;
        setFormValues({
            ...formValues,
            [name]: value
        });
    }, [formValues]);

    const submit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        // setIsSubmitting(true);
        const { name, friendId } = formValues;
        onClose({}, 'submit', { name, friendId });
    }, [formValues, onClose]);

    const cancel = useCallback((): void => {
        setFormValues(defaultFormValues());
        onClose({}, 'cancel');
    }, [onClose]);

    /*
     * Only re-render the dialog contents if the dialog is open. This allows the
     * dialog to keep displaying the same contents while it is undergoing its exit
     * transition, even if the props were changed by the parent component.
     */
    if (!dialogContentsRef.current || props.open) {
        dialogContentsRef.current = (
            <Typography component={'div'}>
                <DialogTitle>
                    Add Master Account
                    {closeIconEnabled && <DialogCloseButton onClick={cancel} />}
                </DialogTitle>
                <DialogContent>
                    <div style={{ width: 360, color: 'red' }}>
                        {errorMessage}
                    </div>
                    {/* FIXME Inline sx prop */}
                    <Box sx={{ p: 2 }}>
                        <form id={FormId} onSubmit={submit}>
                            {/* TODO Add form validation */}
                            <InputFieldContainer width='100%'>
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    label='Nickname (Optional)'
                                    id='name'
                                    name='name'
                                    value={formValues.name}
                                    onChange={handleInputChange}
                                />
                            </InputFieldContainer>
                            <InputFieldContainer width='100%'>
                                <TextField
                                    variant='outlined'
                                    fullWidth
                                    label='Friend ID (Optional)'
                                    id='friendId'
                                    name='friendId'
                                    value={formValues.friendId}
                                    onChange={handleInputChange}
                                />
                            </InputFieldContainer>
                        </form>
                    </Box>
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
                        form={FormId}
                        type='submit'
                    >
                        Add
                    </Button>
                </DialogActions>
            </Typography>
        );
    }

    return (
        <Dialog {...props} fullScreen={fullScreen}>
            {dialogContentsRef.current}
        </Dialog>
    );
});

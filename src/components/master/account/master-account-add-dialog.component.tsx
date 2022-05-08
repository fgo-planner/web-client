import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { useInjectable } from '../../../hooks/dependency-injection/use-injectable.hook';
import { useAutoResizeDialog } from '../../../hooks/user-interface/use-auto-resize-dialog.hook';
import { MasterAccountService } from '../../../services/data/master/master-account.service';
import { DialogComponentProps } from '../../../types/internal';
import { DialogCloseButton } from '../../dialog/dialog-close-button.component';
import { InputFieldContainer } from '../../input/input-field-container.component';

type Props = DialogComponentProps;

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

    const { onClose } = props;

    const {
        fullScreen,
        closeIconEnabled,
        actionButtonVariant
    } = useAutoResizeDialog(props);

    const masterAccountService = useInjectable(MasterAccountService);

    const [formValues, setFormValues] = useState<Form>(defaultFormValues());
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [isMounted, setIsMounted] = useState<boolean>(true);

    useEffect(() => {
        return () => setIsMounted(false);
    }, []);

    const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target;
        setFormValues({
            ...formValues,
            [name]: value
        });
    }, [formValues]);

    const submit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(undefined);
        try {
            const { name, friendId } = formValues;
            await masterAccountService.addAccount({ name, friendId });

            // Only update the state if the component is still mounted.
            if (isMounted) {
                setFormValues(defaultFormValues());
                setIsSubmitting(false);
            }

            onClose({}, 'submit');
        } catch (e: any) {
            setIsSubmitting(false);
            setErrorMessage(e.message || String(e));
        }
    }, [formValues, isMounted, masterAccountService, onClose]);

    const cancel = useCallback((): void => {
        setFormValues(defaultFormValues());
        onClose({}, 'cancel');
    }, [onClose]);

    return (
        <Dialog {...props} fullScreen={fullScreen}>
            <Typography component={'div'}>
                <DialogTitle>
                    Add Master Account
                    {closeIconEnabled && <DialogCloseButton onClick={cancel} />}
                </DialogTitle>
                <DialogContent>
                    <div>
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
                        disabled={isSubmitting}
                    >
                        Add
                    </Button>
                </DialogActions>
            </Typography>
        </Dialog>
    );
});

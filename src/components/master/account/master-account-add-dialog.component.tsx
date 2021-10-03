import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Theme,
    Typography,
} from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import React, { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';
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

const style = (theme: Theme) => ({
    form: {
        padding: theme.spacing(2)
    },
    inputFieldContainer: {
        width: '100%'
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterAccountAddDialog'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterAccountAddDialog = React.memo((props: Props) => {

    const {
        fullScreen,
        closeIconEnabled,
        actionButtonVariant
    } = useAutoResizeDialog(props);

    const classes = useStyles();

    const [formValues, setFormValues] = useState<Form>(defaultFormValues());
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [isMounted, setIsMounted] = useState<boolean>(true);

    useEffect(() => {
        return () => {
            setIsMounted(false);
        };
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
            await MasterAccountService.addAccount({ name, friendId });

            // Only update the state if the component is still mounted.
            if (isMounted) {
                setFormValues(defaultFormValues());
                setIsSubmitting(false);
            }

            props.onClose({}, 'submit');
        } catch (e: any) {
            setIsSubmitting(false);
            setErrorMessage(e.message || String(e));
        }
    }, [formValues, isMounted, props]);

    const cancel = useCallback((): void => {
        setFormValues(defaultFormValues());
        props.onClose({}, 'cancel');
    }, [props]);

    return (
        <Dialog {...props} fullScreen={fullScreen}>
            <Typography component={'div'}>
                <DialogTitle>
                    Add Master Account
                    {closeIconEnabled && <DialogCloseButton onClick={cancel}/>}
                </DialogTitle>
                <DialogContent>
                    <div>
                        {errorMessage}
                    </div>
                    <form className={classes.form} id={FormId} onSubmit={submit}>
                        {/* TODO Add form validation */}
                        <InputFieldContainer className={classes.inputFieldContainer}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                label="Nickname (Optional)"
                                id="name"
                                name="name"
                                value={formValues.name}
                                onChange={handleInputChange}
                            />
                        </InputFieldContainer>
                        <InputFieldContainer className={classes.inputFieldContainer}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                label="Friend ID (Optional)"
                                id="friendId"
                                name="friendId"
                                value={formValues.friendId}
                                onChange={handleInputChange}
                            />
                        </InputFieldContainer>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant={actionButtonVariant}
                        color="secondary"
                        onClick={cancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={actionButtonVariant}
                        color="primary"
                        form={FormId}
                        type="submit"
                        disabled={isSubmitting}
                    >
                        Add
                    </Button>
                </DialogActions>
            </Typography>
        </Dialog>
    );
});

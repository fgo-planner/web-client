import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup, PaperProps, TextField, Typography } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import { Formik, FormikConfig, FormikProps } from 'formik';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { DialogCloseButton } from '../../../../../components/dialog/DialogCloseButton';
import { InputFieldContainer } from '../../../../../components/input/InputFieldContainer';
import { useAutoResizeDialog } from '../../../../../hooks/user-interface/useAutoResizeDialog';
import { DialogComponentProps } from '../../../../../types';
import { FormUtils } from '../../../../../utils/FormUtils';

type FormData = {
    name: string;
    description: string;
    autoUpdate: boolean;
    shared: boolean;
};

export type PlansRoutePlanEditDialogData = {
    /**
     * Function that makes the backend API call to create or update the plan.
     */
    submitAction(data: FormData): Promise<void>;
};

type Props = {
    dialogData?: PlansRoutePlanEditDialogData;
} & Omit<DialogComponentProps, 'open' | 'PaperProps'>;

const FormId = 'plan-edit-form';

const formikConfig: Omit<FormikConfig<FormData>, 'onSubmit'> = {
    initialValues: {
        name: '',
        description: '',
        autoUpdate: false,
        shared: false
    },
    // validationSchema: ValidationSchema,
    validateOnBlur: true
};

const StyleClassPrefix = 'PlansRoutePlanEditDialog';

const StyleProps = {
    [`& .${StyleClassPrefix}-error-message`]: {
        color: 'red',
        px: 2,
        pb: 4
    },
    [`& .${StyleClassPrefix}-form`]: {
        p: 2
    }
} as SystemStyleObject<Theme>;

const DialogPaperProps: PaperProps = {
    style: {
        minWidth: 360
    }
};

export const PlansRoutePlanEditDialog = React.memo((props: Props) => {

    const {
        dialogData,
        onClose,
        ...dialogProps
    } = props;

    const {
        fullScreen,
        closeIconEnabled,
        actionButtonVariant
    } = useAutoResizeDialog(props);

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [, setIsMounted] = useState<boolean>(true);

    const open = !!dialogData;

    useEffect(() => {
        return () => {
            setIsMounted(false);
        };
    }, []);

    const cancel = useCallback((): void => {
        onClose({}, 'cancel');
    }, [onClose]);

    const submit = useCallback(async (values: FormData): Promise<void> => {
        if (!dialogData) {
            return;
        }
        setIsSubmitting(true);
        setErrorMessage(undefined);
        try {
            await dialogData.submitAction(values);
            setIsSubmitting(false);
            onClose({}, 'submit');
        } catch (e: any) {
            setIsSubmitting(false);
            setErrorMessage(e.message || String(e));
        }
    }, [dialogData, onClose]);

    const renderForm = (): ReactNode => (
        <Formik {...formikConfig} onSubmit={submit}>
            {(props: FormikProps<FormData>): ReactNode => {
                const {
                    values,
                    errors,
                    touched,
                    handleBlur,
                    handleChange,
                    handleSubmit
                } = props;

                const touchedErrors = FormUtils.getErrorsForTouchedFields(errors, touched);

                return (
                    <form
                        id={FormId}
                        className={`${StyleClassPrefix}-form`}
                        noValidate
                        onSubmit={e => { e.preventDefault(); handleSubmit(e); }}
                    >
                        <InputFieldContainer width='100%'>
                            <TextField
                                variant='outlined'
                                fullWidth
                                label='Plan Name'
                                name='name'
                                value={values.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={!!touchedErrors.name}
                                helperText={touchedErrors.name}
                            />
                        </InputFieldContainer>
                        <InputFieldContainer width='100%'>
                            <TextField
                                variant='outlined'
                                fullWidth
                                label='Description'
                                name='description'
                                value={values.description}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={!!touchedErrors.description}
                                helperText={touchedErrors.description}
                            />
                        </InputFieldContainer>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name='autoUpdate'
                                        checked={values.autoUpdate}
                                        onChange={handleChange}
                                    />
                                }
                                label='Auto-update'
                            />
                        </FormGroup>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name='shared'
                                        checked={values.shared}
                                        onChange={handleChange}
                                    />
                                }
                                label='Shared'
                            />
                        </FormGroup>
                    </form>
                );
            }}
        </Formik>
    );

    return (
        <Dialog
            {...dialogProps}
            className={`${StyleClassPrefix}-root`}
            fullScreen={fullScreen}
            open={open}
            PaperProps={DialogPaperProps}
            sx={StyleProps}
        >
            <Typography component={'div'}>
                <DialogTitle>
                    Create Plan
                    {closeIconEnabled && <DialogCloseButton onClick={cancel} />}
                </DialogTitle>
                <DialogContent>
                    {errorMessage &&
                        <div className={`${StyleClassPrefix}-error-message`}>
                            {errorMessage}
                        </div>
                    }
                    {renderForm()}
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
                        Create
                    </Button>
                </DialogActions>
            </Typography>
        </Dialog>
    );
});

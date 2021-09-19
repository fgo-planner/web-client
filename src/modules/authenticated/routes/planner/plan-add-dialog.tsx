import { Plan } from '@fgo-planner/types';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup, makeStyles, StyleRules, TextField, Theme, Typography } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/styles';
import { Formik, FormikConfig, FormikProps } from 'formik';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { DialogCloseButton } from '../../../../components/dialog/dialog-close-button.component';
import { InputFieldContainer } from '../../../../components/input/input-field-container.component';
import { useAutoResizeDialog } from '../../../../hooks/user-interface/use-auto-resize-dialog.hook';
import { PlannerService } from '../../../../services/data/planner/planner.service';
import { DialogComponentProps } from '../../../../types/internal';
import { FormUtils } from '../../../../utils/form.utils';

type Props = {
    masterAccountId: string | undefined;
} & DialogComponentProps<Plan>;

type FormData = {
    name: string;
    description: string;
    autoUpdate: boolean;
    shared: boolean;
};

const FormId = 'create-plan-form';

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

const style = (theme: Theme) => ({
    errorMessage: {
        color: 'red',
        padding: theme.spacing(0, 2, 4, 2)
    },
    form: {
        padding: theme.spacing(2)
    },
    inputFieldContainer: {
        width: '100%'
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'PlanAddDialog'
};

const useStyles = makeStyles(style, styleOptions);

export const PlanAddDialog = React.memo((props: Props) => {

    const {
        masterAccountId,
        ...dialogProps
    } = props;

    const onClose = dialogProps.onClose;

    const {
        fullScreen,
        closeIconEnabled,
        actionButtonVariant
    } = useAutoResizeDialog(props);

    const classes = useStyles();

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [isMounted, setIsMounted] = useState<boolean>(true);

    useEffect(() => {
        return () => {
            setIsMounted(false);
        };
    }, []);

    const cancel = useCallback((): void => {
        onClose({}, 'cancel');
    }, [onClose]);

    const submit = useCallback(async (values: FormData): Promise<void> => {
        if (!masterAccountId) {
            return;
        }
        setIsSubmitting(true);
        setErrorMessage(undefined);
        try {
            const plan = await PlannerService.addPlan({
                ...values,
                accountId: masterAccountId
            });
            setIsSubmitting(false);
            onClose({}, 'submit', plan);
        } catch (e) {
            setIsSubmitting(false);
            setErrorMessage(e.message || String(e));
        }
    }, [masterAccountId, onClose]);

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
                        noValidate
                        onSubmit={e => { e.preventDefault(); handleSubmit(e); }}
                    >
                        <div className={classes.root}>
                            <InputFieldContainer className={classes.inputFieldContainer}>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    label="Plan Name"
                                    name="name"
                                    value={values.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={!!touchedErrors.name}
                                    helperText={touchedErrors.name}
                                />
                            </InputFieldContainer>
                            <InputFieldContainer className={classes.inputFieldContainer}>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    label="Description"
                                    name="description"
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
                                            name="autoUpdate"
                                            checked={values.autoUpdate}
                                            onChange={handleChange}
                                        />
                                    }
                                    label="Auto-update"
                                />
                            </FormGroup>
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="shared"
                                            checked={values.shared}
                                            onChange={handleChange}
                                        />
                                    }
                                    label="Shared"
                                />
                            </FormGroup>
                        </div>
                    </form>
                );
            }}
        </Formik>
    );

    return (
        <Dialog {...dialogProps} fullScreen={fullScreen}>
            <Typography component={'div'}>
                <DialogTitle>
                    Create Plan
                    {closeIconEnabled && <DialogCloseButton onClick={cancel} />}
                </DialogTitle>
                <DialogContent>
                    {errorMessage && 
                        <div className={classes.errorMessage}>
                            {errorMessage}
                        </div>
                    }
                    {renderForm()}
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
                        disabled={isSubmitting || !masterAccountId}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Typography>
        </Dialog>
    );
});

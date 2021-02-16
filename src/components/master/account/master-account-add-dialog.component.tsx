import { Button, Dialog, DialogActions, DialogContent, DialogTitle, StyleRules, TextField, Theme, Typography, withStyles, withWidth } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Container as Injectables } from 'typedi';
import { MasterAccountService } from '../../../services/data/master/master-account.service';
import { DialogComponentProps, WithStylesProps } from '../../../types';
import { DialogComponent } from '../../base/dialog-component';
import { DialogCloseButton } from '../../dialog/dialog-close-button.component';
import { InputFieldContainer } from '../../input/input-field-container.component';

type Props = DialogComponentProps & WithStylesProps;

type Form = {
    name: string;
    friendId: string;
};

type State = {
    formValues: Form;
    isSubmitting: boolean;
    errorMessage?: string | null;
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

export const MasterAccountAddDialog = withWidth()(withStyles(style, styleOptions)(class extends DialogComponent<Props, State> {
    
    private readonly _formId = 'master-account-form';

    private _masterAccountService = Injectables.get(MasterAccountService);

    private get _defaultFormValues(): Form {
        return {
            name: '',
            friendId: ''
        };
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            formValues: this._defaultFormValues,
            isSubmitting: false
        };

        this._handleInputChange = this._handleInputChange.bind(this);
        this._submit = this._submit.bind(this);
        this._cancel = this._cancel.bind(this);
    }

    render(): ReactNode {
        const { classes, ...dialogProps } = this.props;
        const { formValues, isSubmitting, errorMessage } = this.state;
        const { fullScreen, closeIconEnabled, actionButtonVariant } = this._computeFullScreenProps();
        return (
            <Dialog {...dialogProps} fullScreen={fullScreen}>
                <Typography component={'div'}>
                    <DialogTitle>
                        Add Master Account
                        {closeIconEnabled && <DialogCloseButton onClick={this._cancel}/>}
                    </DialogTitle>
                    <DialogContent>
                        <div>
                            {errorMessage}
                        </div>
                        <form className={classes.form} id={this._formId} onSubmit={this._submit}>
                            {/* TODO Add form validation */}
                            <InputFieldContainer className={classes.inputFieldContainer}>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    label="Nickname (Optional)"
                                    id="name"
                                    name="name"
                                    value={formValues.name}
                                    onChange={this._handleInputChange}
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
                                    onChange={this._handleInputChange}
                                />
                            </InputFieldContainer>
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant={actionButtonVariant}
                            color="secondary"
                            onClick={this._cancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant={actionButtonVariant}
                            color="primary"
                            form={this._formId}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            Add
                        </Button>
                    </DialogActions>
                </Typography>
            </Dialog>
        );
    }

    private _handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
        const { name, value } = event.target;
        this.setState({
            formValues: {
                ...this.state.formValues,
                [name]: value
            }
        });
    }
    
    private async _submit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        this.setState({ 
            isSubmitting: true,
            errorMessage: null
        });
        try {
            const { name, friendId } = this.state.formValues;
            await this._masterAccountService.addAccount({ name, friendId });

            // Only update the state if the component is still mounted.
            if (this._isMounted) {
                this.setState({ 
                    formValues: this._defaultFormValues,
                    isSubmitting: false
                });
            }

            this.props.onClose({}, 'submit');
        } catch (e) {
            this.setState({
                isSubmitting: false,
                errorMessage: e.message || String(e)
            });
        }
    }

    private _cancel(): void {
        this.setState({
            formValues: this._defaultFormValues
        });
        this.props.onClose({}, 'cancel');
    }

}));

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, StyleRules, TextField, Theme, Typography, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { InputFieldContainer } from 'components';
import { ModalComponent, ModalComponentProps, WithStylesProps } from 'internal';
import React, { ChangeEvent, FormEvent, ReactNode } from 'react';
import { MasterAccountService } from 'services';
import { Container as Injectables } from 'typedi';

type Props = ModalComponentProps & WithStylesProps;

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
        padding: theme.spacing(4, 2, 0, 2)
    },
    inputFieldContainer: {
        width: '256px'
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterAccountAddDialog'
};

export const MasterAccountAddDialog = withStyles(style, styleOptions)(class extends ModalComponent<Props, State> {
    
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
        const { classes } = this.props;
        const { formValues, isSubmitting, errorMessage } = this.state;
        return (
            <Dialog {...this.props} classes={undefined}>
                <Typography component={'div'}>
                    <DialogTitle>
                        Add Master Account
                    </DialogTitle>
                    <DialogContent>
                        <div>
                            {errorMessage}
                        </div>
                        <form className={classes.form} id={this._formId} onSubmit={this._submit}>
                            {/* TODO Add form validation */}
                            <InputFieldContainer classes={classes}>
                                <TextField variant="outlined"
                                           fullWidth
                                           label="Nickname (Optional)"
                                           id="name"
                                           name="name"
                                           value={formValues.name}
                                           onChange={this._handleInputChange}
                                />
                            </InputFieldContainer>
                            <InputFieldContainer classes={classes}>
                                <TextField variant="outlined"
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
                        <Button variant="contained"
                                color="secondary" 
                                onClick={this._cancel}>
                            Cancel
                        </Button>
                        <Button variant="contained"
                                color="primary"
                                form={this._formId}
                                type="submit"
                                disabled={isSubmitting}>
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

});

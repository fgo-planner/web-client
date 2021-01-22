import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, withTheme } from '@material-ui/core';
import { ModalComponent, ModalComponentProps, WithThemeProps } from 'internal';
import React, { ChangeEvent, FormEvent, ReactNode } from 'react';
import { MasterAccountService } from 'services';
import { Container as Injectables } from 'typedi';

type Props = WithThemeProps;

type Form = {
    name: string;
    friendId: string;
};

type State = {
    formValues: Form;
    isSubmitting: boolean;
    errorMessage?: string | null;
};

export const MasterAccountAddDialog = withTheme(class extends ModalComponent<Props, State> {

    private _masterAccountService = Injectables.get(MasterAccountService);

    private get _defaultFormValues(): Form {
        return {
            name: '',
            friendId: ''
        };
    }

    constructor(props: Props & ModalComponentProps) {
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
        const { formValues, isSubmitting, errorMessage } = this.state;
        return (
            <Dialog {...this.props}>
                <Typography component={'div'}>
                    <DialogTitle>
                        Add Account
                    </DialogTitle>
                    <DialogContent>
                        <div>
                            {errorMessage}
                        </div>
                        <form id="login-form" onSubmit={this._submit}>
                            <div>
                                <TextField label="Nickname (Optional)"
                                           variant="outlined"
                                           id="name"
                                           name="name"
                                           value={formValues.name}
                                           onChange={this._handleInputChange}
                                />
                            </div>
                            <div>
                                <TextField label="Friend ID (Optional)"
                                           variant="outlined"
                                           id="friendId"
                                           name="friendId"
                                           value={formValues.friendId}
                                           onChange={this._handleInputChange}
                                />
                            </div>
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
                                form="login-form"
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

    private _cancel() {
        this.setState({
            formValues: this._defaultFormValues
        });
        this.props.onClose({}, 'cancel');
    }

});

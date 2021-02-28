import { Button } from '@material-ui/core';
import { PersonAdd as PersonAddIcon } from '@material-ui/icons';
import React, { Fragment, PureComponent, ReactNode } from 'react';
import { ModalOnCloseReason } from '../../../../types';
import { MasterAccountAddDialog } from '../../../master/account/master-account-add-dialog.component';

type Props = {
    
};

type State = {
    dialogOpen: boolean;
};

export const AppBarMasterAccountAddButton = class extends PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            dialogOpen: false
        };

        this._openDialog = this._openDialog.bind(this);
        this._handleDialogClose = this._handleDialogClose.bind(this);
    }

    render (): ReactNode {
        const { dialogOpen } = this.state;
        return (
            <Fragment>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={this._openDialog}
                >
                    <PersonAddIcon />
                    <div className="pl-2">
                        Add Account 
                    </div>
                </Button>
                <MasterAccountAddDialog
                    PaperProps={{ style: { minWidth: 360 } }}
                    showCloseIcon="never"
                    open={dialogOpen}
                    onClose={this._handleDialogClose}
                />
            </Fragment>
        );
    }

    private _openDialog(): void {
        this.setState({
            dialogOpen: true
        });
    }

    private _handleDialogClose(event: any, reason: ModalOnCloseReason): void {
        /*
         * If the dialog was closed due to successful submit, then don't do anything
         * because this component most like has already been unmounted. Otherwise,
         * update the state.
         */
        if (reason === 'submit') {
            return;
        }
        this.setState({
            dialogOpen: false
        });
    }

};
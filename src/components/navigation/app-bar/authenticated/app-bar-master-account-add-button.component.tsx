import { BasicMasterAccount } from '@fgo-planner/data-core';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import { Fragment, PureComponent, ReactNode } from 'react';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { ModalOnCloseReason } from '../../../../types';
import { InjectablesContainer } from '../../../../utils/dependency-injection/injectables-container';
import { MasterAccountAddDialog } from '../../../master/account/master-account-add-dialog.component';

type Props = {

};

type State = {
    dialogError?: string;
    dialogOpen: boolean;
};

// TODO Convert this to functional component
export const AppBarMasterAccountAddButton = class extends PureComponent<Props, State> {

    // TODO Use the useInjectable hook after converting into functional component.
    private get _masterAccountService() {
        return InjectablesContainer.get(MasterAccountService)!;
    }

    constructor(props: Props) {
        super(props);

        this.state = {
            dialogOpen: false
        };

        this._openDialog = this._openDialog.bind(this);
        this._handleDialogClose = this._handleDialogClose.bind(this);
    }

    render(): ReactNode {
        const {
            dialogError,
            dialogOpen
        } = this.state;
        return (
            <Fragment>
                <Button
                    variant='outlined'
                    color='primary'
                    onClick={this._openDialog}
                >
                    <PersonAddIcon />
                    <div className='pl-2'>
                        Add Account
                    </div>
                </Button>
                <MasterAccountAddDialog
                    // FIXME Inline paper props
                    PaperProps={{ style: { minWidth: 360 } }}
                    showCloseIcon='never'
                    open={dialogOpen}
                    errorMessage={dialogError}
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

    private async _handleDialogClose(_event: any, _reason: ModalOnCloseReason, data?: Partial<BasicMasterAccount>): Promise<void> {
        if (data) {
            try {
                await this._masterAccountService.addAccount(data);
            } catch (e: any) {
                this.setState({
                    dialogError: e.message || String(e)
                });
                return;
            }
        }
        this.setState({
            dialogOpen: false
        });
    }

};

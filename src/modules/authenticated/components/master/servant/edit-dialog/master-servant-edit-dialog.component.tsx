import { Button, Dialog, DialogActions, DialogContent, DialogTitle, StyleRules, Theme, Typography, withStyles, withWidth } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { FormEvent, MouseEvent, ReactNode } from 'react';
import { DialogComponent } from '../../../../../../components/base/dialog-component';
import { DialogCloseButton } from '../../../../../../components/dialog/dialog-close-button.component';
import { DialogComponentProps, MasterServant, MasterServantBondLevel, Nullable, WithStylesProps } from '../../../../../../types';
import { MasterServantUtils } from '../../../../../../utils/master/master-servant.utils';
import { MasterServantEditForm, SubmitData } from '../edit-form/master-servant-edit-form.component';

type RenderedProps = {
    disableServantSelect?: boolean;
    dialogTitle?: string;
    submitButtonLabel?: string;
};

type Props = {
    /**
     * The master servant to edit. If not provided, the dialog will instantiate a
     * new servant.
     */
    masterServant?: MasterServant;
    bondLevels: Record<number, MasterServantBondLevel | undefined>;
    unlockedCostumes: Array<number>;
} & (
    RenderedProps &
    WithStylesProps &
    Omit<DialogComponentProps<SubmitData>, 'keepMounted' | 'onExited' | 'PaperProps'>
);

type State = {
    masterServant: MasterServant;
};

const FormId = 'master-servant-edit-dialog-form';

const style = (theme: Theme) => ({
    form: {
        paddingTop: theme.spacing(4)
    },
    inputFieldGroup: {
        display: 'flex',
        flexWrap: 'nowrap',
        [theme.breakpoints.down('xs')]: {
            flexWrap: 'wrap'
        }
    },
    inputFieldContainer: {
        flex: 1,
        padding: theme.spacing(0, 2),
        [theme.breakpoints.down('xs')]: {
            flex: '100% !important'
        }
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantEditDialog'
};

export const MasterServantEditDialog = withWidth()(withStyles(style, styleOptions)(class extends DialogComponent<Props, State, SubmitData> {

    private _propsSnapshot: Nullable<RenderedProps>;

    constructor(props: Props) {
        super(props);

        const { masterServant } = props;

        this.state = {
            masterServant: masterServant || MasterServantUtils.instantiate() // Instantiate new servant if needed
        };

        this._handleOnDialogExited = this._handleOnDialogExited.bind(this);
        this._submit = this._submit.bind(this);
        this._cancel = this._cancel.bind(this);
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
        if (!nextProps.open && this.props.open) {
            const {
                disableServantSelect,
                dialogTitle,
                submitButtonLabel
            } = this.props;

            this._propsSnapshot = {
                disableServantSelect,
                dialogTitle,
                submitButtonLabel
            };
        }
        return super.shouldComponentUpdate(nextProps, nextState);
    }

    componentDidUpdate(prevProps: Props): void {
        const { masterServant, open } = this.props;
        if (masterServant !== prevProps.masterServant || (open && !prevProps.open)) {
            this.setState({
                masterServant: masterServant || MasterServantUtils.instantiate() // Instantiate new servant if needed
            });
        }
    }

    render(): ReactNode {

        const {
            classes,
            masterServant,
            bondLevels,
            unlockedCostumes,
            disableServantSelect,
            dialogTitle,
            submitButtonLabel,
            ...dialogProps
        } = {
            ...this.props,
            ...this._propsSnapshot
        };

        const {
            fullScreen,
            closeIconEnabled,
            actionButtonVariant
        } = this._computeFullScreenProps();

        return (
            <Dialog
                {...dialogProps}
                PaperProps={{ style: { width: 600 } }}
                fullScreen={fullScreen}
                keepMounted={false}
                onExited={this._handleOnDialogExited}
            >
                <Typography component={'div'}>
                    <DialogTitle>
                        {dialogTitle}
                        {closeIconEnabled && <DialogCloseButton onClick={this._cancel} />}
                    </DialogTitle>
                    <DialogContent>
                        <MasterServantEditForm
                            formId={FormId}
                            masterServant={this.state.masterServant} // Use masterServant from state, not from props.
                            bondLevels={bondLevels}
                            unlockedCostumes={unlockedCostumes}
                            onSubmit={this._submit}
                            servantSelectDisabled={disableServantSelect}
                        />
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
                            form={FormId}
                            type="submit"
                        >
                            {submitButtonLabel || 'Submit'}
                        </Button>
                    </DialogActions>
                </Typography>
            </Dialog>
        );
    }

    private _handleOnDialogExited(): void {
        this._propsSnapshot = null;
    }

    private _submit(event: FormEvent<HTMLFormElement>, data: SubmitData): void {
        const { onClose } = this.props;
        onClose(event, 'submit', data);
    }

    private _cancel(event: MouseEvent<HTMLButtonElement>): void {
        const { onClose } = this.props;
        onClose(event, 'cancel');
    }

}));

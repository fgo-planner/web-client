import { Button, Fab, StyleRules, Theme, Tooltip, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { Clear as ClearIcon, Done as DoneIcon, Publish as PublishIcon } from '@material-ui/icons';
import React, { createRef, Fragment, PureComponent, ReactNode } from 'react';
import { DropzoneRef } from 'react-dropzone';
import { RouteComponentProps as ReactRouteComponentProps, withRouter } from 'react-router-dom';
import { Subscription } from 'rxjs';
import { Container as Injectables } from 'typedi';
import { RouteComponent } from '../../../components/base/route-component';
import { AlertDialog } from '../../../components/dialog/alert-dialog.component';
import { FabContainer } from '../../../components/fab/fab-container.component';
import { FileInputWithTextarea } from '../../../components/input/file-input-with-textarea.component';
import { GameServantService } from '../../../services/data/game/game-servant.service';
import { MasterAccountService } from '../../../services/data/master/master-account.service';
import { FgoManagerMasterServantParser } from '../../../services/import/fgo-manager/fgo-manager-master-servant-parser';
import { MasterServantParserResult } from '../../../services/import/master-servant-parser-result.type';
import { LoadingIndicatorOverlayService } from '../../../services/user-interface/loading-indicator-overlay.service';
import { MasterAccount, Nullable, WithStylesProps } from '../../../types';
import { MasterServantUtils } from '../../../utils/master/master-servant.utils';
import { MasterServantList } from '../components/master/servant/list/master-servant-list.component';

type Props = ReactRouteComponentProps & WithStylesProps;

type State = {
    masterAccount?: Nullable<MasterAccount>;
    importData?: string,
    parsedData?: MasterServantParserResult | null;
    loadingIndicatorId?: string | null;
    importStatus: 'none' | 'fail' | 'success';
};

const FileInputHelperText = 'To import the servant data from FGO Manager, download the \'Roster\' sheet as a .csv file and upload it here.';

const FileInputActionsHelperText = 'Select or drag and drop the .csv file here, or paste the file contents above';

const ParseFailMessage = 'No servants could be parsed from the given data! Please review the data and try again.';

const ParseResultHelperText = `The following servants were parsed from the given data. They have NOT been imported yet. Please review the
    list and click on the confirm button to finalize the import.`;

const ImportSuccessMessage = 'Servants imported successfully!';

const ImportFailMessage = 'An error was encountered while attempting to import servants.';

const style = (theme: Theme) => ({
    fileInputHelperText: {
        color: theme.palette.text.secondary,
        padding: theme.spacing(6, 8, 0, 8)
    },
    fileInputContainer: {
        padding: theme.spacing(4)
    },
    fileInputActions: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingTop: theme.spacing(4)
    },
    fileInputActionsHelperText: {
        color: theme.palette.text.secondary,
        paddingRight: theme.spacing(4)
    },
    importResultsHelperText: {
        color: theme.palette.text.secondary,
        minWidth: `${theme.breakpoints.width('lg')}px`,
        padding: theme.spacing(6, 4, 4, 4)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantImport'
};

const MasterServantImport = withRouter(withStyles(style, styleOptions)(class extends PureComponent<Props, State> {

    private _loadingIndicatorService = Injectables.get(LoadingIndicatorOverlayService);

    private _gameServantService = Injectables.get(GameServantService);

    private _masterAccountService = Injectables.get(MasterAccountService);

    private _onCurrentMasterAccountChangeSubscription!: Subscription;

    private _onCurrentMasterAccountUpdatedSubscription!: Subscription;

    private _dropzoneRef = createRef<DropzoneRef>();

    constructor(props: Props) {
        super(props);

        this.state = {
            importStatus: 'none'
        };

        this._openFileUploadDialog = this._openFileUploadDialog.bind(this);
        this._handleInputChange = this._handleInputChange.bind(this);
        this._parseImportData = this._parseImportData.bind(this);
        this._cancelImport = this._cancelImport.bind(this);
        this._finalizeImport = this._finalizeImport.bind(this);
        this._handleSuccessDialogAction = this._handleSuccessDialogAction.bind(this);
    }

    componentDidMount(): void {
        this._onCurrentMasterAccountChangeSubscription = this._masterAccountService.onCurrentMasterAccountChange
            .subscribe(this._handleCurrentMasterAccountChange.bind(this));
        this._onCurrentMasterAccountUpdatedSubscription = this._masterAccountService.onCurrentMasterAccountUpdated
            .subscribe(this._handleCurrentMasterAccountUpdated.bind(this));
    }

    componentWillUnmount(): void {
        this._onCurrentMasterAccountChangeSubscription.unsubscribe();
        this._onCurrentMasterAccountUpdatedSubscription.unsubscribe();
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const { parsedData, loadingIndicatorId } = this.state;
        /*
         * Turn off the loading indicator if the parsed data has changed.
         */
        if (loadingIndicatorId && prevState.parsedData !== parsedData) {
            this.setState({ loadingIndicatorId: null });
            /*
             * Allow the loading indicator to spin for half more second before hiding it.
             */
            setTimeout(() => {
                this._loadingIndicatorService.waive(loadingIndicatorId);
            }, 500);
        }
    }

    render(): ReactNode {
        const { parsedData } = this.state;
        return (
            <Fragment>
                {parsedData ?
                    this._renderParseResults(parsedData) :
                    this._renderDataInputPrompt()
                }
                <FabContainer children={this._renderFab()} />
            </Fragment>
        );
    }

    private _renderFab() {
        const { importData, parsedData, loadingIndicatorId } = this.state;

        if (!parsedData) {
            const disabled = !importData?.trim().length || !!loadingIndicatorId;
            return (
                <Tooltip title="Import data">
                    <div>
                        <Fab
                            color="primary"
                            onClick={this._parseImportData}
                            disabled={disabled}
                            children={<PublishIcon />}
                        />
                    </div>
                </Tooltip>
            );
        }

        return [
            <Tooltip key="cancel" title="Cancel">
                <div>
                    <Fab
                        color="default"
                        onClick={this._cancelImport}
                        children={<ClearIcon />}
                    />
                </div>
            </Tooltip>,
            <Tooltip key="submit" title="Confirm">
                <div>
                    <Fab
                        color="primary"
                        onClick={this._finalizeImport}
                        children={<DoneIcon />}
                    />
                </div>
            </Tooltip>
        ];
    }

    private _renderDataInputPrompt(): ReactNode {
        const { classes } = this.props;
        const { importData } = this.state;

        const fileInputActions = (
            <div className={classes.fileInputActions}>
                <div className={classes.fileInputActionsHelperText}>
                    {FileInputActionsHelperText}
                </div>
                <Button variant="contained" color="secondary" onClick={this._openFileUploadDialog}>
                    Select File
                </Button>
            </div>
        );

        return (
            <Fragment>
                <div className={classes.fileInputHelperText}>
                    {FileInputHelperText}
                </div>
                <div className={classes.fileInputContainer}>
                    <FileInputWithTextarea
                        dropzoneRef={this._dropzoneRef}
                        rows={15}
                        value={importData}
                        onValueChange={this._handleInputChange}
                    >
                        {fileInputActions}
                    </FileInputWithTextarea>
                </div>
            </Fragment>
        );
    }

    private _renderParseResults(parsedData: MasterServantParserResult): ReactNode {
        const { classes } = this.props;
        const { importStatus } = this.state;
        const { masterServants } = parsedData;
        // TODO Display errors and warning
        if (!masterServants.length) {
            return (
                <AlertDialog
                    open
                    message={ParseFailMessage}
                    confirmButtonColor="primary"
                    confirmButtonLabel="OK"
                    onClose={this._cancelImport}
                />
            );
        }
        return (
            <Fragment>
                <div className={classes.importResultsHelperText}>
                    {ParseResultHelperText}
                </div>
                <MasterServantList openLinksInNewTab masterServants={masterServants} />
                <AlertDialog
                    open={importStatus !== 'none'}
                    message={importStatus === 'success' ? ImportSuccessMessage : ImportFailMessage}
                    confirmButtonColor="primary"
                    confirmButtonLabel="OK"
                    onClose={this._handleSuccessDialogAction}
                />
            </Fragment>
        );
    }

    private _openFileUploadDialog(): void {
        // Note that the ref is set async, so it might be null at some point.
        this._dropzoneRef.current?.open();
    }

    private _handleInputChange(value: string): void {
        this.setState({
            importData: value
        });
    }

    private _parseImportData(): void {
        const { masterAccount, importData } = this.state;
        if (!importData) {
            console.error('No data');
            return;
        }

        // Activate the loading indicator before parsing.
        const loadingIndicatorId = this._loadingIndicatorService.invoke();
        this.setState({ loadingIndicatorId });

        let lastInstanceId = -1;
        if (masterAccount) {
            lastInstanceId = MasterServantUtils.getLastInstanceId(masterAccount.servants);
        }

        // Set timeout to allow the loading indicator to be rendered first.
        setTimeout(async () => {
            const gameServants = await this._gameServantService.getServants();
            const parser = new FgoManagerMasterServantParser(importData, gameServants);
            const parsedData = parser.parse(lastInstanceId + 1);
            this.setState({
                importData: '',
                parsedData
            });
        });
    }

    private _cancelImport(): void {
        this.setState({
            parsedData: null
        });
    }

    private async _finalizeImport(): Promise<void> {
        const { masterAccount, parsedData } = this.state;
        if (!masterAccount || !parsedData) {
            return;
        }

        const loadingIndicatorId = this._loadingIndicatorService.invoke();
        this.setState({ loadingIndicatorId });

        // Combine existing and imported servants
        const servants = [
            ...masterAccount.servants,
            ...parsedData.masterServants
        ];

        try {
            await this._masterAccountService.updateAccount({
                _id: masterAccount._id,
                servants
            });
            this.setState({ importStatus: 'success' });
        } catch (error) {
            console.error(error);
            this.setState({ importStatus: 'fail' });
        }

        this._loadingIndicatorService.waive(loadingIndicatorId);
    }

    private _handleSuccessDialogAction() {
        const { importStatus } = this.state;
        if (importStatus === 'success') {
            this.props.history.push('/user/master/servants');
            return;
        } else if (importStatus === 'fail') {
            this.setState({ importStatus: 'none' });
        }
    }

    private _handleCurrentMasterAccountChange(masterAccount: Nullable<MasterAccount>): void {
        this.setState({ masterAccount });
    }

    private _handleCurrentMasterAccountUpdated(masterAccount: Nullable<MasterAccount>): void {
        if (masterAccount == null) {
            return;
        }
        this.setState({ masterAccount });
    }

}));

export default class MasterServantImportRoute extends RouteComponent {

    render(): ReactNode {
        return <MasterServantImport />;
    }

}

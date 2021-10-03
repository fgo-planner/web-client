import { MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Theme, Typography } from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FormEvent, MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { DialogCloseButton } from '../../../../../../components/dialog/dialog-close-button.component';
import { useAutoResizeDialog } from '../../../../../../hooks/user-interface/use-auto-resize-dialog.hook';
import { DialogComponentProps } from '../../../../../../types/internal';
import { MasterServantUtils } from '../../../../../../utils/master/master-servant.utils';
import { MasterServantEditForm, SubmitData } from '../edit-form/master-servant-edit-form.component';

type Props = {
    /**
     * The master servant to edit. If not provided, the dialog will instantiate a
     * new servant.
     */
    masterServant?: MasterServant;
    bondLevels: Record<number, MasterServantBondLevel | undefined>;
    unlockedCostumes: Array<number>;
    disableServantSelect?: boolean;
    dialogTitle?: string;
    submitButtonLabel?: string;
} & Omit<DialogComponentProps<SubmitData>, 'keepMounted' | 'onExited' | 'PaperProps'>;

const FormId = 'master-servant-edit-dialog-form';

const style = (theme: Theme) => ({
    form: {
        paddingTop: theme.spacing(4)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantEditDialog'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterServantEditDialog = React.memo((props: Props) => {

    const {
        bondLevels,
        unlockedCostumes,
        disableServantSelect,
        dialogTitle,
        submitButtonLabel,
        onClose,
        ...dialogProps
    } = props;

    const classes = useStyles();

    const [masterServant, setMasterServant] = useState<MasterServant>(props.masterServant || MasterServantUtils.instantiate());

    /**
     * Update the masterMaster state if the one from the props has changed.
     */
    useEffect(() => {
        setMasterServant(props.masterServant || MasterServantUtils.instantiate());
    }, [props.masterServant]);

    /**
     * Contains cache of the dialog contents.
     */
    const dialogContentsRef = useRef<JSX.Element>();

    const {
        fullScreen,
        closeIconEnabled,
        actionButtonVariant
    } = useAutoResizeDialog(props);

    const submit = useCallback((event: FormEvent<HTMLFormElement>, data: SubmitData): void => {
        onClose(event, 'submit', data);
    }, [onClose]);

    const cancel = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        onClose(event, 'cancel');
    }, [onClose]);

    /*
     * Only re-render the dialog contents if the dialog is open. This allows the
     * dialog to keep displaying the same contents while it is undergoing its exit
     * transition, even if the props were changed by the parent component.
     */
    if (!dialogContentsRef.current || props.open) {
        dialogContentsRef.current = (
            <Typography component={'div'}>
                <DialogTitle>
                    {dialogTitle}
                    {closeIconEnabled && <DialogCloseButton onClick={cancel} />}
                </DialogTitle>
                <DialogContent>
                    <MasterServantEditForm
                        className={classes.form}
                        formId={FormId}
                        masterServant={masterServant}
                        bondLevels={bondLevels}
                        unlockedCostumes={unlockedCostumes}
                        onSubmit={submit}
                        servantSelectDisabled={disableServantSelect}
                    />
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
                    >
                        {submitButtonLabel || 'Submit'}
                    </Button>
                </DialogActions>
            </Typography>
        );
    }

    return (
        <Dialog
            {...dialogProps}
            PaperProps={{ style: { width: 600 } }}
            fullScreen={fullScreen}
            keepMounted={false}
        >
            {dialogContentsRef.current}
        </Dialog>
    );

});

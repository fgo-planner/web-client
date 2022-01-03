import { MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, PaperProps, Typography } from '@mui/material';
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
    masterServant?: Readonly<MasterServant>;
    bondLevels: Record<number, MasterServantBondLevel>;
    unlockedCostumes: Array<number>;
    disableServantSelect?: boolean;
    showAppendSkills?: boolean;
    dialogTitle?: string;
    submitButtonLabel?: string;
} & Omit<DialogComponentProps<SubmitData>, 'keepMounted' | 'onExited' | 'PaperProps'>;

const FormId = 'master-servant-edit-dialog-form';

const DialogWidth = 600;

const DialogPaperProps = {
    style: {
        width: DialogWidth
    }
} as PaperProps;

export const MasterServantEditDialog = React.memo((props: Props) => {

    const {
        masterServant,
        bondLevels,
        unlockedCostumes,
        disableServantSelect,
        showAppendSkills,
        dialogTitle,
        submitButtonLabel,
        onClose,
        ...dialogProps
    } = props;

    // TODO Find a better name for this variable.
    const [_masterServant, setMasterServant] = useState<Readonly<MasterServant>>(masterServant || MasterServantUtils.instantiate());

    /**
     * Update the masterServant state if the one from the props has changed.
     */
    useEffect(() => {
        setMasterServant(masterServant || MasterServantUtils.instantiate());
    }, [masterServant]);

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
                        formId={FormId}
                        className="pt-4"
                        masterServant={_masterServant}
                        bondLevels={bondLevels}
                        unlockedCostumes={unlockedCostumes}
                        onSubmit={submit}
                        servantSelectDisabled={disableServantSelect}
                        showAppendSkills={showAppendSkills}
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
            PaperProps={DialogPaperProps}
            fullScreen={fullScreen}
            keepMounted={false}
        >
            {dialogContentsRef.current}
        </Dialog>
    );

});

import { MasterServant, MasterServantBondLevel } from '@fgo-planner/types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, PaperProps, Typography } from '@mui/material';
import React, { FormEvent, MouseEvent, useCallback, useEffect, useRef } from 'react';
import { DialogCloseButton } from '../../../../../../components/dialog/dialog-close-button.component';
import { useAutoResizeDialog } from '../../../../../../hooks/user-interface/use-auto-resize-dialog.hook';
import { useForceUpdate } from '../../../../../../hooks/utils/use-force-update.hook';
import { DialogComponentProps, Immutable } from '../../../../../../types/internal';
import { MasterServantUtils } from '../../../../../../utils/master/master-servant.utils';
import { MasterServantEditForm, SubmitData } from '../edit-form/master-servant-edit-form.component';

export type DialogData = SubmitData;

type Props = {
    /**
     * The master servant to edit. If not provided, the dialog will instantiate a
     * new servant.
     */
    masterServant?: Immutable<MasterServant>;
    bondLevels: Record<number, MasterServantBondLevel>;
    unlockedCostumes: Array<number>;
    disableServantSelect?: boolean;
    showAppendSkills?: boolean;
    dialogTitle?: string;
    submitButtonLabel?: string;
} & Omit<DialogComponentProps<DialogData>, 'keepMounted' | 'onExited' | 'PaperProps'>;

const FormId = 'master-servant-edit-dialog-form';

const DialogWidth = 600;

const DialogPaperProps = {
    style: {
        width: DialogWidth
    }
} as PaperProps;

export const MasterServantEditDialog = React.memo((props: Props) => {

    const forceUpdate = useForceUpdate();

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

    const masterServantRef = useRef<Immutable<MasterServant> | undefined>(masterServant);

    /*
     * Update the `masterServantRef` if the `masterServant` prop has changed. If
     * `masterServant` is `undefined`, then a new instance is created to ensure that
     * the ref is never `undefined` from this point forward.
     */
    useEffect(() => {
        if (masterServant && masterServantRef.current === masterServant) {
            return;
        }
        masterServantRef.current = masterServant || MasterServantUtils.instantiate();
        forceUpdate();
    }, [forceUpdate, masterServant]);

    /**
     * Contains cache of the dialog contents.
     */
    const dialogContentsRef = useRef<JSX.Element>();

    const {
        fullScreen,
        closeIconEnabled,
        actionButtonVariant
    } = useAutoResizeDialog(props);

    const submit = useCallback((event: FormEvent<HTMLFormElement>, data: DialogData): void => {
        onClose(event, 'submit', data);
    }, [onClose]);

    const cancel = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        onClose(event, 'cancel');
    }, [onClose]);

    /*
    * This can be undefined during the initial render.
    */
    if (!masterServantRef.current) {
        return null;
    }

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
                        masterServant={masterServantRef.current}
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

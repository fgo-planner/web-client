import { MasterServant, PlanServant, PlanServantType } from '@fgo-planner/types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, PaperProps, Typography } from '@mui/material';
import React, { FormEvent, MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { DialogCloseButton } from '../../../../../../components/dialog/dialog-close-button.component';
import { GameServantConstants } from '../../../../../../constants';
import { useAutoResizeDialog } from '../../../../../../hooks/user-interface/use-auto-resize-dialog.hook';
import { useForceUpdate } from '../../../../../../hooks/utils/use-force-update.hook';
import { DialogComponentProps } from '../../../../../../types/internal';
import { PlanServantUtils } from '../../../../../../utils/plan/plan-servant.utils';
import { PlanServantEditForm, SubmitData } from '../edit-form/plan-servant-edit-form.component';

export type DialogData = SubmitData;

type Props = {
    /** 
     * The type of servant to instantiate of if `planServant` was not provided. If
     * this is also not provided, then defaults to `Unowned`.
     */
    defaultType?: PlanServantType;
    dialogTitle?: string;
    disableServantSelect?: boolean;
    masterServants: ReadonlyArray<MasterServant>;
    /**
     * The plan servant to edit. If not provided, the dialog will instantiate a new
     * servant of type `defaultType`.
     */
    planServant?: Readonly<PlanServant>;
    planServants: ReadonlyArray<PlanServant>;
    showAppendSkills?: boolean;
    submitButtonLabel?: string;
    unlockedCostumes: Array<number>;
} & Omit<DialogComponentProps<DialogData>, 'keepMounted' | 'onExited' | 'PaperProps'>;

const FormId = 'plan-servant-edit-dialog-form';

const DialogWidth = 600;

const DialogPaperProps = {
    style: {
        width: DialogWidth
    }
} as PaperProps;

/**
 * Instantiates a new `PlanServant` based on available owned servants that have
 * not been added to the plan. If there are multiple owned servants available,
 * then the first available servant is used. If there are no owned servants
 * available, or if `defaultType` is specified as `Unowned`, then the
 * `PlanServant` will be instantiated as an unowned servant.
 *
 * @param planServants The servants that are already added to the plan.
 * @param masterServants The servants owned by the master account.
 * @param defaultType (optional) Specifies the type of `PlanServant` to
 * instantiate. Defaults to `Owned`.
 */
const instantiate = (
    planServants: ReadonlyArray<PlanServant>, 
    masterServants: ReadonlyArray<MasterServant>,
    defaultType = PlanServantType.Owned
): PlanServant => {

    if (defaultType === PlanServantType.Owned) {
        /**
         * Owned servants that have not been added to the plan yet.
         */
        const availableServants = PlanServantUtils.findAvailableMasterServants(planServants, masterServants);
        if (availableServants.length) {
            /*
            * Instantiate using first available servant.
            */
            const masterServant = availableServants[0];
            const planServant = PlanServantUtils.instantiate(masterServant.gameId, masterServant.instanceId);
            PlanServantUtils.updateCurrentEnhancements(planServant, masterServant);
            // TODO Populate costume data.
            return planServant;
        }
    }

    /*
     * If there were no more owned servants available, or if `defaultType` was
     * specified as `Unowned`, then instantiate an unowned servant.
     */
    return PlanServantUtils.instantiate(GameServantConstants.DefaultServantId);
};

export const PlanServantEditDialog = React.memo((props: Props) => {

    const forceUpdate = useForceUpdate();

    const {
        defaultType,
        dialogTitle,
        disableServantSelect,
        masterServants,
        planServant,
        planServants,
        showAppendSkills,
        submitButtonLabel,
        unlockedCostumes,
        onClose,
        ...dialogProps
    } = props;

    const [availableServants, setAvailableServants] = useState<Array<MasterServant>>([]);

    const planServantRef = useRef<Readonly<PlanServant> | undefined>(planServant);

    /*
     * Updates the `planServantRef` if the `planServant` prop has changed. If
     * `planServant` is `undefined`, then a new instance is created to ensure that
     * the ref is never `undefined` from this point forward.
     */
    useEffect(() => {
        if (planServant && planServantRef.current === planServant) {
            return;
        }
        planServantRef.current = planServant || instantiate(planServants, masterServants, defaultType);
        forceUpdate();
    }, [defaultType, forceUpdate, masterServants, planServant, planServants]);

    /*
     * Update the list of available servants.
     */
    useEffect(() => {
        const availableServants = PlanServantUtils.findAvailableMasterServants(planServants, masterServants);
        setAvailableServants(availableServants);
    }, [masterServants, planServant, planServants]);

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
    if (!planServantRef.current) {
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
                    <PlanServantEditForm
                        formId={FormId}
                        className='pt-4'
                        planServant={planServantRef.current}
                        availableServants={availableServants}
                        onSubmit={submit}
                        servantSelectDisabled={disableServantSelect}
                        showAppendSkills={showAppendSkills}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        variant={actionButtonVariant}
                        color='secondary'
                        onClick={cancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={actionButtonVariant}
                        color='primary'
                        form={FormId}
                        type='submit'
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

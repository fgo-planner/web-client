import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup, PaperProps, Theme, Typography } from '@mui/material';
import { SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ChangeEvent, MouseEvent, useCallback, useEffect, useState } from 'react';
import { DialogCloseButton } from '../../../../../components/dialog/DialogCloseButton';
import { useAutoResizeDialog } from '../../../../../hooks/user-interface/useAutoResizeDialog';
import { ThemeConstants } from '../../../../../styles/ThemeConstants';
import { DialogComponentProps, ModalOnCloseReason } from '../../../../../types';
import { MasterServantListColumn } from '../../../components/master/servant/list/MasterServantListColumn';

export type MasterServantsRouteColumnSettingsDialogData = {
    /**
     * The current visible columns configuration.
     */
    visibleColumns: Readonly<MasterServantListColumn.Visibility>;
};

type Props = {
    /**
     * If this is `undefined`, then the dialog will remain closed.
     */
    dialogData?: MasterServantsRouteColumnSettingsDialogData;
} & Omit<DialogComponentProps<MasterServantsRouteColumnSettingsDialogData>, 'open' | 'keepMounted' | 'onExited' | 'PaperProps'>;

const CancelButtonLabel = 'Cancel';
const SubmitButtonLabel = 'Done';

const DialogWidth = 400;

const getSelectionStatus = (visibleColumns: MasterServantListColumn.Visibility): [boolean, boolean] => {
    let isAllSelected = true, isNoneSelected = true;
    // Assumes all possible keys are present.
    for (const value of Object.values(visibleColumns)) {
        if (value) {
            isNoneSelected = false;
        } else {
            isAllSelected = false;
        }
    }
    return [isAllSelected, isNoneSelected];
};

// This component does not need StyleClassPrefix.

const DialogPaperStyleProps = (theme: SystemTheme) => {

    const { breakpoints } = theme as Theme;

    return {
        m: 0,
        '& .contents-container': {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            '& .MuiDialogContent-root': {
                '& .MuiButton-root': {
                    mt: 4
                }
            }
        },
        [breakpoints.up('sm')]: {
            width: DialogWidth,
            maxWidth: DialogWidth
        }
    } as SystemStyleObject<SystemTheme>;
};

const DialogPaperProps = {
    sx: DialogPaperStyleProps
} as PaperProps;

export const MasterServantsRouteColumnSettingsDialog = React.memo((props: Props) => {

    const {
        dialogData,
        onClose,
        ...dialogProps
    } = props;

    const {
        fullScreen,
        closeIconEnabled,
        actionButtonVariant
    } = useAutoResizeDialog(props);

    const [visibleColumns, setVisibleColumns] = useState<MasterServantListColumn.Visibility>({});

    const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
    const [isNoneSelected, setIsNoneSelected] = useState<boolean>(false);

    useEffect(() => {
        const visibleColumns = dialogData?.visibleColumns;
        if (visibleColumns) {
            const [isAllSelected, isNoneSelected] = getSelectionStatus(visibleColumns);
            setVisibleColumns({ ...visibleColumns });
            setIsAllSelected(isAllSelected);
            setIsNoneSelected(isNoneSelected);
        }
    }, [dialogData?.visibleColumns]);

    const handleColumnVisibilityChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        const { name, checked: value } = event.target;
        const property = name as MasterServantListColumn.Name;
        setVisibleColumns(visibleColumns => {
            if (visibleColumns[property] === value) {
                return visibleColumns;
            }
            const result = {
                ...visibleColumns,
                [property]: value
            };
            const [isAllSelected, isNoneSelected] = getSelectionStatus(result);
            setIsAllSelected(isAllSelected);
            setIsNoneSelected(isNoneSelected);
            return result;
        });
    }, []);

    const handleSelectAllToggleClick = useCallback((): void => {
        const targetState = !isAllSelected;
        setVisibleColumns({
            npLevel: targetState,
            level: targetState,
            bondLevel: targetState,
            fouHp: targetState,
            fouAtk: targetState,
            skills: targetState,
            appendSkills: targetState,
            summonDate: targetState
        });
        setIsAllSelected(targetState);
        setIsNoneSelected(!targetState);
    }, [isAllSelected]);

    const handleDialogClose = useCallback((event: any, reason: ModalOnCloseReason): void => {
        if (reason === 'submit') {
            onClose(event, reason, { visibleColumns });
        } else {
            onClose(event, reason);
        }
    }, [onClose, visibleColumns]);

    const handleSubmitButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        handleDialogClose(event, 'submit');
    }, [handleDialogClose]);

    const handleCancelButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        onClose(event, 'cancel');
    }, [onClose]);

    return (
        <Dialog
            {...dialogProps}
            PaperProps={DialogPaperProps}
            open={!!dialogData?.visibleColumns}
            fullScreen={fullScreen}
            keepMounted={false}
            onClose={handleDialogClose}
        >
            <Typography component={'div'} className='contents-container'>
                <DialogTitle>
                    Column Settings
                    {closeIconEnabled && <DialogCloseButton onClick={handleCancelButtonClick} />}
                </DialogTitle>
                <DialogContent className={ThemeConstants.ClassScrollbarTrackBorder}>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={isAllSelected}
                                    indeterminate={!isAllSelected && !isNoneSelected}
                                    onChange={handleSelectAllToggleClick}
                                />
                            }
                            label='All'  // TODO Move this to constants
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name='npLevel'
                                    checked={!!visibleColumns.npLevel}
                                    onChange={handleColumnVisibilityChange}
                                />
                            }
                            label='NP level'
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name='level'
                                    checked={!!visibleColumns.level}
                                    onChange={handleColumnVisibilityChange}
                                />
                            }
                            label='Level/ascension'
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name='fouHp'
                                    checked={!!visibleColumns.fouHp}
                                    onChange={handleColumnVisibilityChange}
                                />
                            }
                            label='Fou (HP)'
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name='fouAtk'
                                    checked={!!visibleColumns.fouAtk}
                                    onChange={handleColumnVisibilityChange}
                                />
                            }
                            label='Fou (Attack)'
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name='skills'
                                    checked={!!visibleColumns.skills}
                                    onChange={handleColumnVisibilityChange}
                                />
                            }
                            label='Skills'
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name='appendSkills'
                                    checked={!!visibleColumns.appendSkills}
                                    onChange={handleColumnVisibilityChange}
                                />
                            }
                            label='Append skills'
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name='bondLevel'
                                    checked={!!visibleColumns.bondLevel}
                                    onChange={handleColumnVisibilityChange}
                                />
                            }
                            label='Bond level'
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    name='summonDate'
                                    checked={!!visibleColumns.summonDate}
                                    onChange={handleColumnVisibilityChange}
                                />
                            }
                            label='Summon date'
                        />
                    </FormGroup>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant={actionButtonVariant}
                        color='secondary'
                        onClick={handleCancelButtonClick}
                    >
                        {CancelButtonLabel}
                    </Button>
                    <Button
                        variant={actionButtonVariant}
                        color='primary'
                        onClick={handleSubmitButtonClick}
                    >
                        {SubmitButtonLabel}
                    </Button>
                </DialogActions>
            </Typography>
        </Dialog>
    );

});

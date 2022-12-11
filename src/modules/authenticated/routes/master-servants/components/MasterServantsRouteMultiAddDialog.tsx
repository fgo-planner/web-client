import { MasterServantAggregatedData } from '@fgo-planner/data-core';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, InputLabel, PaperProps, Select, Switch, Typography } from '@mui/material';
import React, { ChangeEvent, MouseEvent, ReactNode, useCallback, useRef, useState } from 'react';
import { DialogCloseButton } from '../../../../../components/dialog/dialog-close-button.component';
import { useGameServantList } from '../../../../../hooks/data/use-game-servant-list.hook';
import { useAutoResizeDialog } from '../../../../../hooks/user-interface/use-auto-resize-dialog.hook';
import { DialogComponentProps } from '../../../../../types';

export type MasterServantsRouteMultiAddDialogData = {
    gameIds: Array<number>,
    summoned: boolean
};

type Props = {
    masterServantsData: ReadonlyArray<MasterServantAggregatedData>;
} & Omit<DialogComponentProps<MasterServantsRouteMultiAddDialogData>, 'keepMounted' | 'onExited' | 'PaperProps'>;

const CancelButtonLabel = 'Cancel';
const SubmitButtonLabel = 'Done';

const DefaultSummonedState = true;

const DialogWidth = 600;
const DialogHeight = 600;

// This component does not need StyleClassPrefix.

const DialogPaperProps = {
    sx: {
        width: DialogWidth,
        maxWidth: DialogWidth,
        height: DialogHeight,
        m: 0,
        '& .contents-container': {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            '& .MuiDialogContent-root': {
                display: 'flex',
                flexDirection: 'column',
                '& .MuiFormControl-root': {
                    flex: 1,
                    width: '100%',
                    my: 2,
                    '& .MuiInputBase-root': {
                        height: '100%',
                        '& select': {
                            height: '100%',
                            boxSizing: 'border-box',
                            px: 0,
                            py: 2,
                            '& option': {
                                px: 4,
                                py: 2
                            }
                        }
                    }
                },
                '& .quick-select-container': {
                    display: 'flex',
                    alignItems: 'center',
                    pt: 1,
                    pb: 6,
                    '& .MuiButton-root': {
                        width: 72,
                        ml: 2
                    }
                },
                '& .lower-row': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }
            }
        }
    }
} as PaperProps;

/**
 * Dialog for bulk adding master servants. Specific to the master-servants
 * route.
 */
export const MasterServantsRouteMultiAddDialog = React.memo((props: Props) => {

    const gameServantList = useGameServantList();

    const {
        masterServantsData,
        onClose,
        open,
        ...dialogProps
    } = props;

    /**
     * Contains cache of the dialog contents.
     */
    const dialogContentsRef = useRef<JSX.Element>();

    const [selectedServants, setSelectedServants] = useState<Array<number>>([]);

    const [summoned, setSummoned] = useState<boolean>(DefaultSummonedState);

    const {
        fullScreen,
        closeIconEnabled,
        actionButtonVariant
    } = useAutoResizeDialog(props);

    const handleSelectAll = useCallback(() => {
        if (!gameServantList) {
            return;
        }
        const selectedServants = gameServantList.map(({ _id: gameId }) => gameId);
        setSelectedServants(selectedServants);
    }, [gameServantList]);

    const handleDeselectAll = useCallback(() => {
        setSelectedServants([]);
    }, []);

    const handleSelectMissing = useCallback(() => {
        if (!gameServantList) {
            return;
        }
        const masterServantGameIdsSet = new Set(masterServantsData.map(servantData => servantData.masterServant.gameId));
        const selectedServants = gameServantList
            .map(gameServant => gameServant._id)
            .filter(gameId => !masterServantGameIdsSet.has(gameId));

        setSelectedServants(selectedServants);
    }, [gameServantList, masterServantsData]);

    const handleMultiSelectChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        const { options } = event.target;
        const selectedServants = [] as Array<number>;
        for (let i = 0, { length } = options; i < length; i++) {
            const { selected, value } = options[i];
            if (!selected) {
                continue;
            }
            selectedServants.push(Number(value));
        }
        setSelectedServants(selectedServants);
    }, []);

    const handleSummonedChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        setSummoned(event.target.checked);
    }, []);

    const handleSubmitButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        const gameIds = [...selectedServants];
        setSelectedServants([]);
        setSummoned(DefaultSummonedState);
        onClose(event, 'submit', { gameIds, summoned });
    }, [onClose, selectedServants, summoned]);

    const handleCancelButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        setSelectedServants([]);
        setSummoned(DefaultSummonedState);
        onClose(event, 'cancel');
    }, [onClose]);

    const handleDialogClose = useCallback((event: any, reason: 'backdropClick' | 'escapeKeyDown'): void => {
        setSelectedServants([]);
        setSummoned(DefaultSummonedState);
        onClose(event, reason);
    }, [onClose]);

    /**
     * Only re-render the dialog contents if the dialog is open. This allows the
     * dialog to keep displaying the same contents while it is undergoing its exit
     * transition, even if the props were changed by the parent component.
     */
    if (open) {

        let servantSelectOptions: ReactNode;
        if (!gameServantList?.length) {
            servantSelectOptions = <option>No servants available</option>;
        } else {
            // TODO Allow the user to sort list by either `gameId` or `collectionNo`.
            servantSelectOptions = gameServantList.map(({ _id: gameId, name, rarity }) => (
                <option key={gameId} value={gameId}>
                    {`${rarity} \u2605 ${name}`}
                </option>
            ));
        }

        dialogContentsRef.current = (
            <Typography component={'div'} className='contents-container'>
                <DialogTitle>
                    Add Multiple Servants
                    {closeIconEnabled && <DialogCloseButton onClick={handleCancelButtonClick} />}
                </DialogTitle>
                <DialogContent>
                    <FormControl>
                        <InputLabel shrink>
                            Select Servants
                        </InputLabel>
                        <Select
                            multiple
                            native
                            value={selectedServants}
                            // @ts-ignore Typings are not considering `native`
                            onChange={handleMultiSelectChange}
                            disabled={!gameServantList?.length}
                        >
                            {servantSelectOptions}
                        </Select>
                    </FormControl>
                    <div className='quick-select-container'>
                        <div>Quick Select: </div>
                        <Button onClick={handleDeselectAll}>
                            None
                        </Button>
                        <Button onClick={handleSelectAll}>
                            All
                        </Button>
                        <Button onClick={handleSelectMissing}>
                            Missing
                        </Button>
                    </div>
                    <div className='lower-row'>
                        <FormGroup row>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={summoned}
                                        onChange={handleSummonedChange}
                                    />
                                }
                                label={summoned ? 'Add as summoned' : 'Add as un-summoned'}
                            />
                        </FormGroup>
                        <div className='selection-count'>
                            {`${selectedServants.length} servants selected`}
                        </div>
                    </div>
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
        );
    }

    return (
        <Dialog
            {...dialogProps}
            PaperProps={DialogPaperProps}
            open={open}
            fullScreen={fullScreen}
            keepMounted={false}
            onClose={handleDialogClose}
        >
            {dialogContentsRef.current}
        </Dialog>
    );

});

import { CollectionUtils, Functions } from '@fgo-planner/common-core';
import { MasterServantAggregatedData } from '@fgo-planner/data-core';
import { alpha, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormGroup, PaperProps, Switch, Theme, Typography } from '@mui/material';
import { SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ChangeEvent, MouseEvent, useCallback, useRef, useState } from 'react';
import { DialogCloseButton } from '../../../../../components/dialog/dialog-close-button.component';
import { ServantSelectList, StyleClassPrefix as ServantSelectListStyleClassPrefix } from '../../../../../components/input/servant/select-list/ServantSelectList';
import { useGameServantList } from '../../../../../hooks/data/useGameServantList';
import { useAutoResizeDialog } from '../../../../../hooks/user-interface/use-auto-resize-dialog.hook';
import { ScrollbarStyleProps } from '../../../../../styles/scrollbar-style-props';
import { ThemeConstants } from '../../../../../styles/theme-constants';
import { DialogComponentProps } from '../../../../../types';
import { GameServantUtils } from '../../../../../utils/game/game-servant.utils';

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

const DialogPaperStyleProps = (theme: Theme) => {

    const { palette } = theme as Theme;

    return  {
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
                height: '100%',
                [`& .${ServantSelectListStyleClassPrefix}-root`]: {
                    borderRadius: 1,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: alpha(palette.text.primary, 0.23),
                    overflowY: 'auto'
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
    } as SystemStyleObject<SystemTheme>;
};

const DialogPaperProps = {
    sx: [
        ScrollbarStyleProps,
        DialogPaperStyleProps
    ]
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

    const [selectedServantIds, setSelectedServantIds] = useState<ReadonlySet<number>>(CollectionUtils.emptySet);

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
        const selectedServantIds = new Set(gameServantList.map(GameServantUtils.getId));
        setSelectedServantIds(selectedServantIds);
    }, [gameServantList]);

    const handleDeselectAll = useCallback(() => {
        setSelectedServantIds(CollectionUtils.emptySet());
    }, []);

    const handleSelectMissing = useCallback(() => {
        if (!gameServantList) {
            return;
        }
        const masterServantGameIdsSet = new Set(masterServantsData.map(servantData => servantData.masterServant.gameId));
        const selectedServantIds = gameServantList
            .map(gameServant => gameServant._id)
            .filter(gameId => !masterServantGameIdsSet.has(gameId));

        setSelectedServantIds(new Set(selectedServantIds));
    }, [gameServantList, masterServantsData]);

    const handleSummonedChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
        setSummoned(event.target.checked);
    }, []);

    const handleSubmitButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        const gameIds = [...selectedServantIds];
        setSelectedServantIds(CollectionUtils.emptySet());
        setSummoned(DefaultSummonedState);
        onClose(event, 'submit', { gameIds, summoned });
    }, [onClose, selectedServantIds, summoned]);

    const handleCancelButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
        setSelectedServantIds(CollectionUtils.emptySet());
        setSummoned(DefaultSummonedState);
        onClose(event, 'cancel');
    }, [onClose]);

    const handleDialogClose = useCallback((event: any, reason: 'backdropClick' | 'escapeKeyDown'): void => {
        setSelectedServantIds(CollectionUtils.emptySet());
        setSummoned(DefaultSummonedState);
        onClose(event, reason);
    }, [onClose]);

    /**
     * Only re-render the dialog contents if the dialog is open. This allows the
     * dialog to keep displaying the same contents while it is undergoing its exit
     * transition, even if the props were changed by the parent component.
     */
    if (open) {
        dialogContentsRef.current = (
            <Typography component={'div'} className='contents-container'>
                <DialogTitle>
                    Add Multiple Servants
                    {closeIconEnabled && <DialogCloseButton onClick={handleCancelButtonClick} />}
                </DialogTitle>
                <DialogContent className={ThemeConstants.ClassScrollbarTrackBorder}>
                    <ServantSelectList
                        getGameServantFunction={Functions.identity}
                        getIdFunction={GameServantUtils.getId}
                        onSelectionChange={setSelectedServantIds}
                        // showThumbnail
                        selectedIds={selectedServantIds}
                        servantsData={gameServantList}
                    />
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
                            {`${selectedServantIds.size} servants selected`}
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

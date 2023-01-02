import { GameSoundtrack } from '@fgo-planner/data-core';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { MouseEvent, useCallback, useEffect, useState } from 'react';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { BackgroundMusicService } from '../../../../services/audio/background-music.service';
import { SoundtrackPlayerService } from '../../../../services/audio/soundtrack-player.service';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { ModalOnCloseReason } from '../../../../types';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { RouteDataEditControls } from '../../components/control/RouteDataEditControls';
import { RouteDataEditReloadOnStaleDataDialog } from '../../components/control/RouteDataEditReloadOnStaleDataDialog';
import { RouteDataEditSaveOnStaleDataDialog } from '../../components/control/RouteDataEditSaveOnStaleDataDialog';
import { MasterAccountDataEditHookOptions, useMasterAccountDataEdit } from '../../hooks/useMasterAccountDataEdit';
import { MasterSoundtracksList } from './master-soundtracks-list.component';

const MasterAccountDataEditOptions = {
    includeSoundtracks: true
} as const satisfies MasterAccountDataEditHookOptions;

const StyleClassPrefix = 'MasterSoundtracks';

const StyleProps = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    [`& .${StyleClassPrefix}-main-content`]: {
        display: 'flex',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        [`& .${StyleClassPrefix}-list-container`]: {
            flex: 1,
            overflow: 'hidden'
        }
    }
} as SystemStyleObject<SystemTheme>;

export const MasterSoundtracksRoute = React.memo(() => {

    const {
        awaitingRequest,
        isDataDirty,
        isDataStale,
        masterAccountEditData,
        updateSoundtracks,
        reloadData,
        revertChanges,
        persistChanges
    } = useMasterAccountDataEdit(MasterAccountDataEditOptions);

    // TODO Move these to a dialog state hook.
    const [reloadDialogOpen, setReloadDialogOpen] = useState<boolean>(false);
    const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);

    const backgroundMusicService = useInjectable(BackgroundMusicService);
    const soundtrackPlayerService = useInjectable(SoundtrackPlayerService);

    const [playingId, setPlayingId] = useState<number>();

    /*
     * Play status change subscription.
     */
    useEffect(() => {
        const onPlayStatusChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.Audio.SoundtrackPlayStatusChange)
            .subscribe(status => {
                if (!status) {
                    setPlayingId(undefined);
                }
            });
        return () => {
            soundtrackPlayerService.pause();
            onPlayStatusChangeSubscription.unsubscribe();
        };
    }, [soundtrackPlayerService]);

    const handlePlayButtonClick = useCallback((soundtrack: GameSoundtrack, action: 'play' | 'pause'): void => {
        const { audioUrl } = soundtrack;
        /*
         * If the action is pause or the request track does not have a source URL,
         * then just stop the audio.
         */
        if (action === 'pause' || !audioUrl) {
            soundtrackPlayerService.pause();
            setPlayingId(undefined);
            return;
        }
        /*
         * Pause the background audio if it's playing before playing the new audio.
         */
        backgroundMusicService.pause();
        /*
         * Play the audio.
         */
        soundtrackPlayerService.play(audioUrl);
        setPlayingId(soundtrack._id);
    }, [backgroundMusicService, soundtrackPlayerService]);
    
    const handleSoundtrackChange = useCallback((soundtrackId: number, unlocked: boolean): void => {
        let updatedSoundtracks: Array<number>;
        if (unlocked) {
            updatedSoundtracks = [...masterAccountEditData.soundtracks, soundtrackId];
        } else {
            updatedSoundtracks = [...masterAccountEditData.soundtracks].filter(id => id !== soundtrackId);
        }
        updateSoundtracks(updatedSoundtracks);
    }, [masterAccountEditData, updateSoundtracks]);

    const saveData = useCallback(async (): Promise<void> => {
        try {
            persistChanges();
        } catch (error: any) {
            // TODO Display error message to user.
            console.error(error);
        }
    }, [persistChanges]);

    const handleSaveButtonClick = useCallback((_event: MouseEvent): void => {
        if (isDataStale) {
            setSaveDialogOpen(true);
        } else {
            saveData();
        }
    }, [isDataStale, saveData]);

    const handleReloadButtonClick = useCallback((_event: MouseEvent): void => {
        setReloadDialogOpen(true);
    }, []);

    const handleRevertButtonClick = useCallback((_event: MouseEvent): void => {
        revertChanges();
    }, [revertChanges]);

    const handleReloadDataDialogClose = useCallback((_event: MouseEvent, reason: ModalOnCloseReason): void => {
        if (reason === 'submit') {
            reloadData();
        }
        setReloadDialogOpen(false);
    }, [reloadData]);

    const handleSaveDataDialogClose = useCallback((_event: MouseEvent, reason: ModalOnCloseReason): void => {
        if (reason === 'submit') {
            saveData();
        }
        setSaveDialogOpen(false);
    }, [saveData]);

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <RouteDataEditControls
                disabled={awaitingRequest}
                isDataDirty={isDataDirty}
                isDataStale={isDataStale}
                title='Unlocked Soundtracks'
                onReloadButtonClick={handleReloadButtonClick}
                onRevertButtonClick={handleRevertButtonClick}
                onSaveButtonClick={handleSaveButtonClick}
            />
            <div className={`${StyleClassPrefix}-main-content`}>
                <div className={clsx(`${StyleClassPrefix}-list-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                    <MasterSoundtracksList
                        unlockedSoundtracks={masterAccountEditData.soundtracks}
                        playingId={playingId}
                        onPlayButtonClick={handlePlayButtonClick}
                        onChange={handleSoundtrackChange}
                    />
                </div>
            </div>
            <RouteDataEditReloadOnStaleDataDialog
                open={reloadDialogOpen}
                onClose={handleReloadDataDialogClose}
            />
            <RouteDataEditSaveOnStaleDataDialog
                open={saveDialogOpen}
                onClose={handleSaveDataDialogClose}
            />
        </Box>
    );

});

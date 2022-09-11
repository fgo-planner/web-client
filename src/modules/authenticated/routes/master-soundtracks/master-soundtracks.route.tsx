import { GameSoundtrack } from '@fgo-planner/data-core';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { RouteDataEditControls } from '../../../../components/control/route-data-edit-controls.component';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { BackgroundMusicService } from '../../../../services/audio/background-music.service';
import { SoundtrackPlayerService } from '../../../../services/audio/soundtrack-player.service';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { useMasterAccountDataEditHook } from '../../hooks/use-master-account-data-edit.hook';
import { MasterSoundtracksList } from './master-soundtracks-list.component';

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
        isDataDirty,
        masterAccountEditData,
        updateSoundtracks,
        revertChanges,
        persistChanges
    } = useMasterAccountDataEditHook({ includeSoundtracks: true });

    const backgroundMusicService = useInjectable(BackgroundMusicService);
    const soundtrackPlayerService = useInjectable(SoundtrackPlayerService);

    const [awaitingRequest, setAwaitingRequest] = useState<boolean>(false);

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

    const handleSaveButtonClick = useCallback(async (): Promise<void> => {
        setAwaitingRequest(true);
        try {
            await persistChanges();
            setAwaitingRequest(false);
        } catch (error: any) {
            // TODO Display error message to user.
            console.error(error);
            setAwaitingRequest(false);
            revertChanges();
        }
    }, [persistChanges, revertChanges]);

    const handleRevertButtonClick = useCallback((): void => {
        revertChanges();
    }, [revertChanges]);

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <RouteDataEditControls
                title='Unlocked Soundtracks'
                hasUnsavedData={isDataDirty}
                onSaveButtonClick={handleSaveButtonClick}
                onRevertButtonClick={handleRevertButtonClick}
                disabled={awaitingRequest}
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
        </Box>
    );

});

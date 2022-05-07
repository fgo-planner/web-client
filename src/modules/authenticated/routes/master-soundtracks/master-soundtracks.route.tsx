import { GameSoundtrack, MasterAccount } from '@fgo-planner/types';
import { Clear as ClearIcon, Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { Fab, Tooltip } from '@mui/material';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { LayoutContentSection } from '../../../../components/layout/layout-content-section.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useLoadingIndicator } from '../../../../hooks/user-interface/use-loading-indicator.hook';
import { BackgroundMusicService } from '../../../../services/audio/background-music.service';
import { SoundtrackPlayerService } from '../../../../services/audio/soundtrack-player.service';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { Nullable } from '../../../../types/internal';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { MasterSoundtracksListHeader } from './master-soundtracks-list-header.component';
import { MasterSoundtracksList } from './master-soundtracks-list.component';

const getUnlockedSoundtracksSetFromMasterAccount = (account: Nullable<MasterAccount>): Set<number> => {
    if (!account) {
        return new Set();
    }
    return new Set(account.soundtracks);
};

export const MasterSoundtracksRoute = React.memo(() => {

    const {
        invokeLoadingIndicator,
        resetLoadingIndicator,
        isLoadingIndicatorActive
    } = useLoadingIndicator();

    const backgroundMusicService = useInjectable(BackgroundMusicService);
    const masterAccountService = useInjectable(MasterAccountService);
    const soundtrackPlayerService = useInjectable(SoundtrackPlayerService);

    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    const [unlockedSoundtracksSet, setUnlockedSoundtracksSet] = useState<Set<number>>(new Set());
    const [playingId, setPlayingId] = useState<number>();
    const [editMode, setEditMode] = useState<boolean>(false);

    /*
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(account => {
                const unlockedSoundtracksSet = getUnlockedSoundtracksSetFromMasterAccount(account);
                setMasterAccount(account);
                setUnlockedSoundtracksSet(unlockedSoundtracksSet);
                setEditMode(false);
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

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

    const handleEditButtonClick = useCallback((): void => {
        setEditMode(true);
    }, []);

    const handleSaveButtonClick = useCallback(async (): Promise<void> => {
        const masterAccountId = masterAccount?._id;
        if (!masterAccountId) {
            return;
        }
        invokeLoadingIndicator();

        const update = {
            _id: masterAccountId,
            soundtracks: [...unlockedSoundtracksSet]
        };
        try {
            await masterAccountService.updateAccount(update);
        } catch (error: any) {
            // TODO Display error message to user.
            console.error(error);
            const unlockedSoundtracksSet = getUnlockedSoundtracksSetFromMasterAccount(masterAccount);
            setUnlockedSoundtracksSet(unlockedSoundtracksSet);
            setEditMode(false);
        }
        resetLoadingIndicator();

    }, [invokeLoadingIndicator, masterAccount, masterAccountService, resetLoadingIndicator, unlockedSoundtracksSet]);

    const handleCancelButtonClick = useCallback((): void => {
        // Re-clone data from master account
        const unlockedSoundtracksSet = getUnlockedSoundtracksSetFromMasterAccount(masterAccount);
        setUnlockedSoundtracksSet(unlockedSoundtracksSet);
        setEditMode(false);
    }, [masterAccount]);

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

    /**
     * FabContainer children
     */
    let fabContainerChildNodes: ReactNode;
    if (!editMode) {
        fabContainerChildNodes = (
            <Tooltip key="edit" title="Edit">
                <div>
                    <Fab
                        color="primary"
                        onClick={handleEditButtonClick}
                        disabled={isLoadingIndicatorActive}
                        children={<EditIcon />}
                    />
                </div>
            </Tooltip>
        );
    } else {
        fabContainerChildNodes = [
            <Tooltip key="cancel" title="Cancel">
                <div>
                    <Fab
                        color="default"
                        onClick={handleCancelButtonClick}
                        disabled={isLoadingIndicatorActive}
                        children={<ClearIcon />}
                    />
                </div>
            </Tooltip>,
            <Tooltip key="save" title="Save">
                <div>
                    <Fab
                        color="primary"
                        onClick={handleSaveButtonClick}
                        disabled={isLoadingIndicatorActive}
                        children={<SaveIcon />}
                    />
                </div>
            </Tooltip>
        ];
    }

    return (
        <div className="flex column full-height">
            <PageTitle>
                {editMode ?
                    'Edit Unlocked Soundtracks' :
                    'Unlocked Soundtracks'
                }
            </PageTitle>
            <div className="flex overflow-hidden">
                <LayoutContentSection
                    className='py-4 pr-4 flex-fill'
                    fullHeight
                    scrollbarTrackBorder
                >
                    <div className='flex column full-height'>
                        <MasterSoundtracksListHeader />
                        <div className='overflow-auto'>
                            <MasterSoundtracksList
                                unlockedSoundtracksSet={unlockedSoundtracksSet}
                                playingId={playingId}
                                editMode={editMode}
                                onPlayButtonClick={handlePlayButtonClick}
                            />
                        </div>
                    </div>
                </LayoutContentSection>
            </div>
            <FabContainer children={fabContainerChildNodes} />
        </div>
    );

});

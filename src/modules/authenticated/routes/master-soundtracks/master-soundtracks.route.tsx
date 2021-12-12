import { GameSoundtrack, MasterAccount } from '@fgo-planner/types';
import { Clear as ClearIcon, Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { Fab, Tooltip } from '@mui/material';
import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { LayoutPanelScrollable } from '../../../../components/layout/layout-panel-scrollable.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useInjectable } from '../../../../hooks/dependency-injection/use-injectable.hook';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { BackgroundMusicService } from '../../../../services/audio/background-music.service';
import { SoundtrackPlayerService } from '../../../../services/audio/soundtrack-player.service';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { LoadingIndicatorOverlayService } from '../../../../services/user-interface/loading-indicator-overlay.service';
import { Nullable } from '../../../../types/internal';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopic } from '../../../../utils/subscription/subscription-topic';
import { MasterSoundtracksListHeader } from './master-soundtracks-list-header.component';
import { MasterSoundtracksList } from './master-soundtracks-list.component';

const getUnlockedSoundtracksSetFromMasterAccount = (account: Nullable<MasterAccount>): Set<number> => {
    if (!account) {
        return new Set();
    }
    return new Set(account.soundtracks);
};

export const MasterSoundtracksRoute = React.memo(() => {

    const forceUpdate = useForceUpdate();

    const loadingIndicatorOverlayService = useInjectable(LoadingIndicatorOverlayService);
    const masterAccountService = useInjectable(MasterAccountService);

    const backgroundMusicService = useInjectable(BackgroundMusicService);
    const soundtrackPlayerService = useInjectable(SoundtrackPlayerService);

    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    const [unlockedSoundtracksSet, setUnlockedSoundtracksSet] = useState<Set<number>>(new Set());
    const [playingId, setPlayingId] = useState<number>();
    const [editMode, setEditMode] = useState<boolean>(false);

    const loadingIndicatorIdRef = useRef<string>();

    const resetLoadingIndicator = useCallback((): void => {
        const loadingIndicatorId = loadingIndicatorIdRef.current;
        if (loadingIndicatorId) {
            loadingIndicatorOverlayService.waive(loadingIndicatorId);
            loadingIndicatorIdRef.current = undefined;
            forceUpdate();
        }
    }, [forceUpdate, loadingIndicatorOverlayService]);

    /**
     * onCurrentMasterAccountChange subscriptions
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopic.User_CurrentMasterAccountChange)
            .subscribe(account => {
                const unlockedSoundtracksSet = getUnlockedSoundtracksSetFromMasterAccount(account);
                setMasterAccount(account);
                setUnlockedSoundtracksSet(unlockedSoundtracksSet);
                setEditMode(false);
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    /**
     * onCurrentMasterAccountUpdate subscriptions
     */
    useEffect(() => {
        const onCurrentMasterAccountUpdateSubscription = SubscribablesContainer
            .get(SubscriptionTopic.User_CurrentMasterAccountUpdate)
            .subscribe(account => {
                if (account == null) {
                    return;
                }
                const unlockedSoundtracksSet = getUnlockedSoundtracksSetFromMasterAccount(account);
                resetLoadingIndicator();
                setMasterAccount(account);
                setUnlockedSoundtracksSet(unlockedSoundtracksSet);
                setEditMode(false);
            });

        return () => onCurrentMasterAccountUpdateSubscription.unsubscribe();
    }, [resetLoadingIndicator]);

    /*
     * onPlayStatusChange subscriptions
     */
    useEffect(() => {
        const onPlayStatusChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopic.Audio_SoundtrackPlayStatusChange)
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

    const handleUpdateError = useCallback((error: any): void => {
        // TODO Display error message to user.
        console.error(error);
        const unlockedSoundtracksSet = getUnlockedSoundtracksSetFromMasterAccount(masterAccount);
        resetLoadingIndicator();
        setUnlockedSoundtracksSet(unlockedSoundtracksSet);
        setEditMode(false);
    }, [masterAccount, resetLoadingIndicator]);

    const handleEditButtonClick = useCallback((): void => {
        setEditMode(true);
    }, []);

    const handleSaveButtonClick = useCallback((): void => {
        const masterAccountId = masterAccount?._id;
        if (!masterAccountId) {
            return;
        }

        const update = {
            _id: masterAccountId,
            soundtracks: [...unlockedSoundtracksSet]
        };
        masterAccountService.updateAccount(update)
            .catch(handleUpdateError);

        let loadingIndicatorId = loadingIndicatorIdRef.current;
        if (!loadingIndicatorId) {
            loadingIndicatorId = loadingIndicatorOverlayService.invoke();
        }
        loadingIndicatorIdRef.current = loadingIndicatorId;

    }, [handleUpdateError, loadingIndicatorOverlayService, masterAccount?._id, masterAccountService, unlockedSoundtracksSet]);

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
    const fabContainerChildNodes: ReactNode = useMemo(() => {
        if (!editMode) {
            return (
                <Tooltip key="edit" title="Edit">
                    <div>
                        <Fab
                            color="primary"
                            onClick={handleEditButtonClick}
                            disabled={!!loadingIndicatorIdRef.current}
                            children={<EditIcon />}
                        />
                    </div>
                </Tooltip>
            );
        }
        return [
            <Tooltip key="cancel" title="Cancel">
                <div>
                    <Fab
                        color="default"
                        onClick={handleCancelButtonClick}
                        disabled={!!loadingIndicatorIdRef.current}
                        children={<ClearIcon />}
                    />
                </div>
            </Tooltip>,
            <Tooltip key="save" title="Save">
                <div>
                    <Fab
                        color="primary"
                        onClick={handleSaveButtonClick}
                        disabled={!!loadingIndicatorIdRef.current}
                        children={<SaveIcon />}
                    />
                </div>
            </Tooltip>
        ];
    }, [editMode, handleCancelButtonClick, handleEditButtonClick, handleSaveButtonClick]);

    return (
        <div className="flex column full-height">
            <PageTitle>
                {editMode ?
                    'Edit Unlocked Soundtracks' :
                    'Unlocked Soundtracks'
                }
            </PageTitle>
            <div className="flex overflow-hidden">
                <LayoutPanelScrollable
                    className="p-4 full-height flex-fill scrollbar-track-border"
                    headerContents={
                        <MasterSoundtracksListHeader />
                    }
                    children={
                        <MasterSoundtracksList
                            unlockedSoundtracksSet={unlockedSoundtracksSet}
                            playingId={playingId}
                            editMode={editMode}
                            onPlayButtonClick={handlePlayButtonClick}
                        />
                    }
                />
            </div>
            <FabContainer children={fabContainerChildNodes} />
        </div>
    );

});

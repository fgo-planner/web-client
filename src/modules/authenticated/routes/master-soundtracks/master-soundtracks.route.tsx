import { Fab, Tooltip } from '@material-ui/core';
import { Clear as ClearIcon, Edit as EditIcon, Save as SaveIcon } from '@material-ui/icons';
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { FabContainer } from '../../../../components/fab/fab-container.component';
import { LayoutPanelScrollable } from '../../../../components/layout/layout-panel-scrollable.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useForceUpdate } from '../../../../hooks/utils/use-force-update.hook';
import { BackgroundMusicService } from '../../../../services/audio/background-music.service';
import { SoundtrackPlayerService } from '../../../../services/audio/soundtrack-player.service';
import { MasterAccountService } from '../../../../services/data/master/master-account.service';
import { LoadingIndicatorOverlayService } from '../../../../services/user-interface/loading-indicator-overlay.service';
import { GameSoundtrack, MasterAccount, Nullable } from '../../../../types';
import { MasterSoundtrackListHeader } from './master-soundtracks-list-header.component';
import { MasterSoundtracksList } from './master-soundtracks-list.component';

const getSoundtrackSetFromMasterAccount = (account: Nullable<MasterAccount>): Set<number> => {
    if (!account) {
        return new Set();
    }
    return new Set(account.soundtracks);
};

export const MasterSoundtracksRoute = React.memo(() => {

    const forceUpdate = useForceUpdate();

    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    const [masterSoundtrackSet, setMasterSoundtrackSet] = useState<Set<number>>(new Set());
    const [playingId, setPlayingId] = useState<number>();
    const [editMode, setEditMode] = useState<boolean>(false);

    const loadingIndicatorIdRef = useRef<string>();

    const resetLoadingIndicator = useCallback((): void => {
        const loadingIndicatorId = loadingIndicatorIdRef.current;
        if (loadingIndicatorId) {
            LoadingIndicatorOverlayService.waive(loadingIndicatorId);
            loadingIndicatorIdRef.current = undefined;
            forceUpdate();
        }
    }, [loadingIndicatorIdRef, forceUpdate]);

    /**
     * onCurrentMasterAccountChange subscriptions
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = MasterAccountService.onCurrentMasterAccountChange
            .subscribe(account => {
                const masterSoundtrackSet = getSoundtrackSetFromMasterAccount(account);
                setMasterAccount(account);
                setMasterSoundtrackSet(masterSoundtrackSet);
                setEditMode(false);
            });

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    /**
     * onCurrentMasterAccountUpdated subscriptions
     */
    useEffect(() => {
        const onCurrentMasterAccountUpdatedSubscription = MasterAccountService.onCurrentMasterAccountUpdated
            .subscribe(account => {
                if (account == null) {
                    return;
                }
                const masterSoundtrackSet = getSoundtrackSetFromMasterAccount(account);
                resetLoadingIndicator();
                setMasterAccount(account);
                setMasterSoundtrackSet(masterSoundtrackSet);
                setEditMode(false);
            });

        return () => onCurrentMasterAccountUpdatedSubscription.unsubscribe();
    }, [resetLoadingIndicator]);

    /*
     * onPlayStatusChange subscriptions
     */
    useEffect(() => {
        const onPlayStatusChangeSubscription = SoundtrackPlayerService.onPlayStatusChange
            .subscribe(status => {
                if (!status) {
                    setPlayingId(undefined);
                }
            });
        return () => {
            SoundtrackPlayerService.pause();
            onPlayStatusChangeSubscription.unsubscribe();
        };
    }, []);

    const handleUpdateError = useCallback((error: any): void => {
        // TODO Display error message to user.
        console.error(error);
        const masterSoundtrackSet = getSoundtrackSetFromMasterAccount(masterAccount);
        resetLoadingIndicator();
        setMasterSoundtrackSet(masterSoundtrackSet);
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
            soundtracks: [...masterSoundtrackSet]
        };
        MasterAccountService.updateAccount(update)
            .catch(handleUpdateError.bind(this));

        let loadingIndicatorId = loadingIndicatorIdRef.current;
        if (!loadingIndicatorId) {
            loadingIndicatorId = LoadingIndicatorOverlayService.invoke();
        }
        loadingIndicatorIdRef.current = loadingIndicatorId;

    }, [masterSoundtrackSet, masterAccount?._id, handleUpdateError]);

    const handleCancelButtonClick = useCallback((): void => {
        // Re-clone data from master account
        const masterSoundtrackSet = getSoundtrackSetFromMasterAccount(masterAccount);
        setMasterSoundtrackSet(masterSoundtrackSet);
        setEditMode(false);
    }, [masterAccount]);

    const handlePlayButtonClick = useCallback((soundtrack: GameSoundtrack, action: 'play' | 'pause'): void => {
        const { audioUrl } = soundtrack;
        /*
         * If the action is pause or the request track does not have a source URL,
         * then just stop the audio.
         */
        if (action === 'pause' || !audioUrl) {
            SoundtrackPlayerService.pause();
            setPlayingId(undefined);
            return;
        }
        /*
         * Pause the background audio if it's playing before playing the new audio.
         */
        BackgroundMusicService.pause();
        /*
         * Play the audio.
         */
        SoundtrackPlayerService.play(audioUrl);
        setPlayingId(soundtrack._id);
    }, []);

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
                        disabled={!!loadingIndicatorIdRef.current}
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
    }

    return (
        <div className="flex column full-height">
            <PageTitle>
                {editMode ?
                    'Edit Unlocked Soundtrack' :
                    'Unlocked Soundtrack'
                }
            </PageTitle>
            <div className="flex overflow-hidden">
                <LayoutPanelScrollable className="p-4 full-height flex-fill scrollbar-track-border">
                    <MasterSoundtrackListHeader />
                    <MasterSoundtracksList
                        masterSoundtrackSet={masterSoundtrackSet}
                        playingId={playingId}
                        editMode={editMode}
                        onPlayButtonClick={handlePlayButtonClick}
                    />
                </LayoutPanelScrollable>
            </div>
            <FabContainer children={fabContainerChildNodes} />
        </div>
    );

});
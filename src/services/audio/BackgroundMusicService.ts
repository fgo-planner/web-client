import { AssetConstants } from '../../constants';
import { Injectable } from '../../decorators/dependency-injection/Injectable.decorator';
import { SubscribablesContainer } from '../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../utils/subscription/SubscriptionTopics';

@Injectable
export class BackgroundMusicService {

    private readonly _AudioPath = AssetConstants.BackgroundMusic;

    private readonly _DefaultVolume = 0.5;

    private _audioEl?: HTMLAudioElement;

    private get _onBackgroundPlayStatusChange() {
        return SubscribablesContainer.get(SubscriptionTopics.Audio.BackgroundPlayStatusChange);
    }

    constructor() {
        /*
         * This class is meant to last the lifetime of the application; no need to
         * unsubscribe from subscriptions.
         */
        SubscribablesContainer
            .get(SubscriptionTopics.Audio.SoundtrackPlayStatusChange)
            .subscribe(this._handleSoundtrackPlayStatusChange.bind(this));
    }

    async play(): Promise<void> {
        let audioEl = this._audioEl;
        if (!audioEl) {
            audioEl = this._audioEl = new Audio(this._AudioPath);
        }
        audioEl.volume = this._DefaultVolume;
        try {
            await audioEl.play();
            this._onBackgroundPlayStatusChange.next(true);
        } catch (e) {
            console.error(e);
            return;
        }
    }

    pause(): void {
        if (!this._audioEl) {
            return;
        }
        this._audioEl.pause();
        this._onBackgroundPlayStatusChange.next(false);
    }

    private _handleSoundtrackPlayStatusChange(playing: boolean): void {
        if (playing) {
            this.pause();
        }
    }

}
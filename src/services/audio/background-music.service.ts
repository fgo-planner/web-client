import { AssetConstants } from '../../constants';
import { Injectable } from '../../decorators/dependency-injection/injectable.decorator';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopic } from '../../utils/subscription/subscription-topic';

@Injectable
export class BackgroundMusicService {

    private readonly _AudioPath = AssetConstants.BackgroundMusic;

    private readonly _DefaultVolume = 0.5;

    private _audioEl?: HTMLAudioElement;

    private get _onBackgroundPlayStatusChange() {
        return SubscribablesContainer.get(SubscriptionTopic.Audio_BackgroundPlayStatusChange);
    }

    constructor() {
        /*
         * This class is meant to last the lifetime of the application; no need to
         * unsubscribe from subscriptions.
         */
        SubscribablesContainer
            .get(SubscriptionTopic.Audio_SoundtrackPlayStatusChange)
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
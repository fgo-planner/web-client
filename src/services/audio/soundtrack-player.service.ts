import { Injectable } from '../../decorators/dependency-injection/injectable.decorator';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../utils/subscription/subscription-topics';

@Injectable
export class SoundtrackPlayerService {

    private readonly _DefaultVolume = 0.5;

    private _audioEl?: HTMLAudioElement;

    private get _onSoundtrackPlayStatusChange() {
        return SubscribablesContainer.get(SubscriptionTopics.Audio.SoundtrackPlayStatusChange);
    }

    constructor() {
        /*
         * This class is meant to last the lifetime of the application; no need to
         * unsubscribe from subscriptions.
         */
        SubscribablesContainer
            .get(SubscriptionTopics.Audio.BackgroundPlayStatusChange)
            .subscribe(this._handleBackgroundPlayStatusChange.bind(this));
    }

    async play(src: string): Promise<void> {
        let audioEl = this._audioEl;
        if (!audioEl) {
            audioEl = this._audioEl = new Audio();
            audioEl.volume = this._DefaultVolume;
            audioEl.loop = true;
        }
        audioEl.src = src;
        try {
            await audioEl.play();
            this._onSoundtrackPlayStatusChange.next(true);
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
        this._onSoundtrackPlayStatusChange.next(false);
    }

    private _handleBackgroundPlayStatusChange(playing: boolean): void {
        if (playing) {
            this.pause();
        }
    }

}

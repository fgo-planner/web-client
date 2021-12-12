import { Injectable } from '../../decorators/dependency-injection/injectable.decorator';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopic } from '../../utils/subscription/subscription-topic';

@Injectable
export class SoundtrackPlayerService {

    private readonly _DefaultVolume = 0.5;

    private _audioEl?: HTMLAudioElement;

    private get _onPlayStatusChange() {
        return SubscribablesContainer.get(SubscriptionTopic.Audio_BackgroundPlayStatusChange);
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
            this._onPlayStatusChange.next(true);
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
        this._onPlayStatusChange.next(false);
    }

}

import { BehaviorSubject } from 'rxjs';
import { AssetConstants } from '../../constants';

export class BackgroundMusicService {

    private static readonly _AudioPath = AssetConstants.BackgroundMusic;

    private static readonly _DefaultVolume = 0.5;

    private static _audioEl: HTMLAudioElement;

    static readonly onPlayStatusChange = new BehaviorSubject<boolean>(false);

    static async play(): Promise<void> {
        let audioEl = this._audioEl;
        if (!audioEl) {
            audioEl = this._audioEl = new Audio(this._AudioPath);
        }
        audioEl.volume = this._DefaultVolume;
        try {
            await audioEl.play();
            this.onPlayStatusChange.next(true);
        } catch (e) {
            console.error(e);
            return;
        }
    }

    static pause(): void {
        if (!this._audioEl) {
            return;
        }
        this._audioEl.pause();
        this.onPlayStatusChange.next(false);
    }

}
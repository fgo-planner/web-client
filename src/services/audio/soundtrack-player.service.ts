import { BehaviorSubject } from 'rxjs';

export class SoundtrackPlayerService {

    private static readonly _DefaultVolume = 0.5;

    private static _audioEl: HTMLAudioElement;

    static readonly onPlayStatusChange = new BehaviorSubject<boolean>(false);

    static async play(src: string): Promise<void> {
        let audioEl = this._audioEl;
        if (!audioEl) {
            audioEl = this._audioEl = new Audio();
            audioEl.volume = this._DefaultVolume;
            audioEl.loop = true;
        }
        audioEl.src = src;
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

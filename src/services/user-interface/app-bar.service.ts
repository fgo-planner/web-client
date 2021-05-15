import { BehaviorSubject } from 'rxjs';

export class AppBarService {

    static readonly onElevatedChange = new BehaviorSubject<boolean>(false);

    private static elevated = false;

    static setElevated(elevated: boolean): void {
        if (this.elevated === elevated) {
            return;
        }
        this.elevated = elevated;
        this.onElevatedChange.next(elevated);
    }

}
import { BehaviorSubject } from 'rxjs';

export class LoadingIndicatorOverlayService {

    private static readonly _InvocationIdSet = new Set<string>();

    static readonly onDisplayStatusChange = new BehaviorSubject<boolean>(false);

    static invoke(): string {
        const id = String(new Date().getTime());
        this._InvocationIdSet.add(id);
        if (!this.onDisplayStatusChange.value) {
            this.onDisplayStatusChange.next(true);
        }
        return id;
    }

    static waive(id: string): void {
        this._InvocationIdSet.delete(id);
        if (!this._InvocationIdSet.size) {
            this.onDisplayStatusChange.next(false);
        }
    }

}

import { Service } from 'typedi';
import { BehaviorSubject } from 'rxjs';

@Service()
export class LoadingIndicatorOverlayService {

    private readonly _idSet = new Set<string>();

    readonly onDisplayStatusChange = new BehaviorSubject<boolean>(false);

    invoke(): string {
        const id = String(new Date().getTime());
        this._idSet.add(id);
        if (!this.onDisplayStatusChange.value) {
            this.onDisplayStatusChange.next(true);
        }
        return id;
    }

    waive(id: string): void {
        this._idSet.delete(id);
        if (!this._idSet.size) {
            this.onDisplayStatusChange.next(false);
        }
    }

}

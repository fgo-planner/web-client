import { Injectable } from '../../decorators/dependency-injection/injectable.decorator';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../utils/subscription/subscription-topics';

@Injectable
export class LoadingIndicatorOverlayService {

    private readonly _InvocationIdSet = new Set<string>();

    private _display = false;

    private get _onDisplayStatusChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.LoadingIndicatorDisplayChange);
    }

    invoke(): string {
        const id = String(new Date().getTime());
        this._InvocationIdSet.add(id);
        if (!this._display) {
            this._onDisplayStatusChange.next(this._display = true);
        }
        return id;
    }

    waive(id: string): void {
        this._InvocationIdSet.delete(id);
        if (!this._InvocationIdSet.size) {
            this._onDisplayStatusChange.next(this._display = false);
        }
    }

}

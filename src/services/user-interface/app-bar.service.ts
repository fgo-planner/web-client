import { Injectable } from '../../decorators/dependency-injection/injectable.decorator';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../utils/subscription/subscription-topics';

@Injectable
export class AppBarService {

    private get _onElevatedChange() {
        return SubscribablesContainer.get(SubscriptionTopics.UserInterface.AppBarElevatedChange);
    }

    private _elevated = false;

    setElevated(elevated: boolean): void {
        if (this._elevated === elevated) {
            return;
        }
        this._elevated = elevated;
        this._onElevatedChange.next(elevated);
    }

}

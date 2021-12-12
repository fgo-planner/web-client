import { Injectable } from '../../decorators/dependency-injection/injectable.decorator';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopic } from '../../utils/subscription/subscription-topic';

@Injectable
export class AppBarService {

    private get _onElevatedChange() {
        return SubscribablesContainer.get(SubscriptionTopic.UserInterface_AppBarElevatedChange);
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

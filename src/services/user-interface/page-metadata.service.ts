import { Injectable } from '../../decorators/dependency-injection/injectable.decorator';
import { PageMetadata } from '../../types/internal';
import { SubscribablesContainer } from '../../utils/subscription/subscribables-container';
import { SubscriptionTopic } from '../../utils/subscription/subscription-topic';

@Injectable
export class PageMetadataService {

    private _metadata: PageMetadata = {};

    private get _onMetadataChange() {
        return SubscribablesContainer.get(SubscriptionTopic.UserInterface_MetadataChange);
    }

    setTitle(title: string | undefined): void {
        if (title !== this._metadata.title) {
            if (title === undefined) {
                delete this._metadata.title;
            } else {
                this._metadata.title = title;
            }
            this._notifyChanges();
        }
    }

    resetTitle(): void {
        if (this._metadata.title !== undefined) {
            delete this._metadata.title;
            this._notifyChanges();
        }
    }

    setThemeColor(themeColor: string | undefined): void {
        if (themeColor !== this._metadata.themeColor) {
            this._metadata.themeColor = themeColor;
            this._notifyChanges();
        }
    }

    private _notifyChanges(): void {
        this._onMetadataChange.next({
            ...this._metadata
        });
    }

}

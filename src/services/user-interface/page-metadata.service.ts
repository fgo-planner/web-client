import { BehaviorSubject } from 'rxjs';

type Metadata = {
    title?: string;
    themeColor?: string;
};

export type PageMetadata = Readonly<Metadata>;

export class PageMetadataService {

    private static _metadata: Metadata = {};

    static readonly onMetadataChange = new BehaviorSubject<PageMetadata>({});

    static setTitle(title: string | undefined): void {
        if (title !== this._metadata.title) {
            if (title === undefined) {
                delete this._metadata.title;
            } else {
                this._metadata.title = title;
            }
            this._notifyChanges();
        }
    }

    static resetTitle(): void {
        if (this._metadata.title !== undefined) {
            delete this._metadata.title;
            this._notifyChanges();
        }
    }

    static setThemeColor(themeColor: string | undefined): void {
        if (themeColor !== this._metadata.themeColor) {
            this._metadata.themeColor = themeColor;
            this._notifyChanges();
        }
    }

    private static _notifyChanges(): void {
        this.onMetadataChange.next({
            ...this._metadata
        });
    }

}

import { LoadingIndicator } from 'components';
import React, { PureComponent, ReactNode } from 'react';
import { Subscription } from 'rxjs';
import { LoadingIndicatorOverlayService } from 'services';
import { Container as Injectables } from 'typedi';

type Props = {

};

type State = {
    show: boolean;
};

export class LoadingIndicatorOverlay extends PureComponent<Props, State> {

    private _loadingIndicatorService = Injectables.get(LoadingIndicatorOverlayService);

    private _onDisplayStatusChangeSubscription!: Subscription;


    constructor(props: Props) {
        super(props);

        this.state = {
            show: false
        };
    }

    componentDidMount(): void {
        this._onDisplayStatusChangeSubscription = this._loadingIndicatorService.onDisplayStatusChange
            .subscribe(show => this.setState({ show }));
    }

    componentWillUnmount(): void {
        this._onDisplayStatusChangeSubscription.unsubscribe();
    }

    render(): ReactNode {
        const { show } = this.state;
        return <LoadingIndicator show={show} />;
    }

}
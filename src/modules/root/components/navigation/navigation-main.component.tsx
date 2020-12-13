import { Paper } from '@material-ui/core';
import React, { Component, Fragment, ReactNode, UIEvent } from 'react';
import { AppBar } from './app-bar.component';
import './navigation-main.component.scss';

type Props = {

};

type State = {
    appBarElevated: boolean;
};

export class NavigationMain extends Component<Props, State> {

    private readonly ElevatedAppBarScrollThreshold = 15;

    /**
     * Elevation (in dp) of the elevated App Bar.
     * @see https://material.io/design/environment/elevation.html
     */
    private readonly ElevatedAppBarElevation = 4;

    constructor(props: Props) {
        super(props);
        this.state = {
            appBarElevated: false
        };
    }

    render(): ReactNode {
        console.log(`${NavigationMain.name} RENDERED`)
        const scrollHandler = this.scrollHandler.bind(this);
        return (
            <div className="navigation-container">
                <div className="upper-section">
                    <Paper className={`app-bar-container ${this.state.appBarElevated ? '' : 'no-elevation'}`}
                           elevation={this.ElevatedAppBarElevation}
                           square={true}>
                        <AppBar></AppBar>
                    </Paper>
                </div>
                <div className="lower-section">
                    {/* TODO Add nav rail */}
                    <div className="main-content-container" onScroll={scrollHandler}>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }

    private scrollHandler(event: UIEvent) {
        const scrollAmount = (event.target as Element)?.scrollTop;
        const appBarElevated = scrollAmount > this.ElevatedAppBarScrollThreshold;
        if (appBarElevated !== this.state.appBarElevated) {
            this.setState({ appBarElevated });
        }
    }

}

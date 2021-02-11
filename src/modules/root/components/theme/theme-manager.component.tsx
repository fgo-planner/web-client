import { Theme, ThemeProvider, Typography, createMuiTheme } from '@material-ui/core';
import React, { Component, Fragment, ReactNode } from 'react';
import { Subscription } from 'rxjs';
import { ThemeService } from 'services';
import { Container as Injectables } from 'typedi';
import { ThemeBackground } from './theme-background.component';

type Props = {

};

type State = {
    theme: Theme;
    backgroundImageUrl?: string | null;
};

/**
 * Utility component for managing and updating the application's theme state.
 */
export class ThemeManager extends Component<Props, State> {

    private _themeService = Injectables.get(ThemeService);

    private _onThemeChangeSubscription!: Subscription;

    constructor(props: Props) {
        super(props);
        this.state = {
            theme: createMuiTheme({}) // Initialize with default Material-UI theme
        };
    }

    componentDidMount(): void {
        this._onThemeChangeSubscription = this._themeService.onThemeChange
            .subscribe(this._handleThemeChange.bind(this));
    }

    componentWillUnmount(): void {
        this._onThemeChangeSubscription.unsubscribe();
    }

    render(): ReactNode {
        return (
            <Fragment>
                <ThemeBackground opacity={0.5} imageUrl={this.state.backgroundImageUrl}/>
                <ThemeProvider theme={this.state.theme}>
                    <Typography component={'div'}>
                        {this.props.children}
                    </Typography>
                </ThemeProvider>
            </Fragment>
        );
    }

    private _handleThemeChange(theme: Theme): void {
        this.setState({ theme });
    }

}

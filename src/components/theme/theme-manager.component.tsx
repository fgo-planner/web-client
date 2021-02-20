import { createMuiTheme, Theme, ThemeProvider, Typography } from '@material-ui/core';
import { Component, Fragment, ReactNode } from 'react';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../services/user-interface/theme.service';
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

    private _onThemeChangeSubscription!: Subscription;

    constructor(props: Props) {
        super(props);
        this.state = {
            theme: createMuiTheme({}) // Initialize with default Material-UI theme
        };
    }

    componentDidMount(): void {
        this._onThemeChangeSubscription = ThemeService.onThemeChange
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

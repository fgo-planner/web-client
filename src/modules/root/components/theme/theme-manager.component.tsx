import { Box, Button, createMuiTheme, ThemeProvider, Typography } from '@material-ui/core';
import React, { Component, Fragment, ReactNode } from 'react';
import overrides from '../../../../styles/material-ui-overrides';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { ThemeBackground } from './theme-background.component';
import { Nullable } from 'internal';

type Props = {

};

type State = {
    backgroundImageUrl?: string | null;
};

/**
 * Utility component for managing and updating the application's theme state.
 */
export class ThemeManager extends Component<Props, State> {

    private theme = createMuiTheme({
        spacing: ThemeConstants.Spacing,
        palette: {
            primary: {
                main: '#EC407A'
            },
            secondary: {
                main: '#039BE5'
            }

        },
        overrides
    });

    private backgroundImageUrl: Nullable<string>;

    private themeState = true;

    render(): ReactNode {
        return (
            <Fragment>
                <ThemeBackground opacity={0.5} imageUrl={this.backgroundImageUrl}/>
                <ThemeProvider theme={this.theme}>
                    <Typography component={'div'}>
                        {this.props.children}
                        <Box mt={4}>
                            <Button onClick={this.toggleTheme.bind(this)}>CHANGE THEME</Button>
                        </Box>
                    </Typography>
                </ThemeProvider>
            </Fragment>
        );
    }

    toggleTheme() {
        if (this.themeState = !this.themeState) {
            this.theme = createMuiTheme({
                spacing: ThemeConstants.Spacing,
                palette: {
                    primary: {
                        main: '#EC407A'
                    },
                    secondary: {
                        main: '#039BE5'
                    }

                },
                overrides
            });
            this.backgroundImageUrl = undefined;
        } else {
            this.theme = createMuiTheme({
                spacing: ThemeConstants.Spacing,
                palette: {
                    primary: {
                        main: '#FA9'
                    },
                    secondary: {
                        main: '#BADA55'
                    }
        
                }
            });
            this.backgroundImageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHw%3D&w=1000&q=80"
        }
        this.forceUpdate();
    }

}

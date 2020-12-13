import React, { Component, ReactNode, Fragment } from 'react';
import { ThemeProvider, createMuiTheme, Button, Typography } from '@material-ui/core';
import { ThemeBackground } from './theme-background.component';

type Props = {

};

type State = {

};

/**
 * Utility component for managing and updating the application's theme state.
 */
export class ThemeManager extends Component<Props, State> {

    private theme = createMuiTheme({
        palette: {
            primary: {
                main: '#EC407A'
            },
            secondary: {
                main: '#039BE5'
            }

        },
        overrides: {
            MuiButton: {
                text: {
                    textTransform: 'none'
                },
            }
        }
    });

    private backgroundImageUrl: string = null;

    private themeState = true;

    render(): ReactNode {
        return (
            <Fragment>
                <ThemeBackground color={null} opacity={0.5} imageUrl={this.backgroundImageUrl}/>
                <ThemeProvider theme={this.theme}>
                    <Typography component={'div'}>
                        {this.props.children}
                        <Button onClick={this.toggleTheme.bind(this)}>CHANGE THEME</Button>
                    </Typography>
                </ThemeProvider>
            </Fragment>
        );
    }

    toggleTheme() {
        if (this.themeState = !this.themeState) {
            this.theme = createMuiTheme({
                palette: {
                    primary: {
                        main: '#EC407A'
                    },
                    secondary: {
                        main: '#039BE5'
                    }
        
                },
                overrides: {
                    MuiButton: {
                        text: {
                            textTransform: 'none'
                        },
                    }
                }
            });
            this.backgroundImageUrl = null;
        } else {
            this.theme = createMuiTheme({
                palette: {
                    primary: {
                        main: '#039BE5'
                    },
                    secondary: {
                        main: '#EC407A'
                    }
        
                }
            });
            this.backgroundImageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHw%3D&w=1000&q=80"
        }
        this.forceUpdate();
    }

}

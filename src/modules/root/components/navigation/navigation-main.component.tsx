import { Paper, Theme, withStyles } from '@material-ui/core';
import { ClassNameMap, StyleRules } from '@material-ui/core/styles/withStyles';
import { WithStylesProps } from 'internal';
import React, { Component, ReactNode, UIEvent } from 'react';
import { ThemeConstants } from 'styles';
import { ThemeUtils } from 'utils';
import { AppBar } from './app-bar/app-bar.component';

type Props = WithStylesProps;

type State = {
    appBarElevated: boolean;
};

const style = (theme: Theme) => ({
    root: {
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        top: 0,
        left: 0,
        right: 0,
        height: '100vh'
    },
    upperSection: {
        zIndex: 2
    },
    lowerSection: {
        display: 'flex',
        height: `calc(100vh - ${ThemeUtils.spacingInPixels(theme, ThemeConstants.AppBarHeightScale)})`
    },
    navRailContainer: {
        display: 'none',
        zIndex: 1,
        boxShadow: '0 2px 1px -1px rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.014), 0 1px 3px 0 rgba(0,0,0,0.12)',
    },
    mainContent: {
        flex: 1,
        overflow: 'auto'
    }
} as StyleRules);

export const NavigationMain = withStyles(style)(class extends Component<Props, State> {

    private readonly styleClasses: ClassNameMap;

    constructor(props: Props) {
        super(props);
        this.styleClasses = props.classes;
        this.state = {
            appBarElevated: false
        };
    }

    render(): ReactNode {
        const scrollHandler = this.scrollHandler.bind(this);
        return (
            <div className={this.styleClasses.root}>
                <div className={this.styleClasses.upperSection}>
                    <AppBar appBarElevated={this.state.appBarElevated} />
                </div>
                <div className={this.styleClasses.lowerSection}>
                    {/* TODO Add nav rail */}
                    <div className={this.styleClasses.mainContent} onScroll={scrollHandler}>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }

    private scrollHandler(event: UIEvent) {
        const scrollAmount = (event.target as Element)?.scrollTop;
        const appBarElevated = scrollAmount > ThemeConstants.AppBarElevatedScrollThreshold;
        if (appBarElevated !== this.state.appBarElevated) {
            this.setState({ appBarElevated });
        }
    }

});

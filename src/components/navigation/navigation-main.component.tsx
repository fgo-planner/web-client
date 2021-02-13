import { StyleRules, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { Component, ReactNode, UIEvent } from 'react';
import { ThemeConstants } from '../../styles/theme-constants';
import { WithStylesProps } from '../../types';
import { AppBar } from './app-bar/app-bar.component';
import { LoadingIndicatorOverlay } from './loading-indicator-overlay';

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
        height: `calc(100vh - ${theme.spacing(ThemeConstants.AppBarHeightScale)}px)`
    },
    navRailContainer: {
        display: 'none',
        zIndex: 1,
        boxShadow: '0 2px 1px -1px rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.014), 0 1px 3px 0 rgba(0,0,0,0.12)',
    },
    mainContent: {
        flex: 1,
        overflow: 'auto',
        background: theme.palette.background.paper,
        color: theme.palette.text.primary
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'NavigationMain'
};

export const NavigationMain = withStyles(style, styleOptions)(class extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            appBarElevated: false
        };
        this._handleScroll = this._handleScroll.bind(this);
    }

    render(): ReactNode {
        const styleClasses = this.props.classes;
        return (
            <div className={styleClasses.root}>
                <div className={styleClasses.upperSection}>
                    <AppBar appBarElevated={this.state.appBarElevated} />
                </div>
                <div className={styleClasses.lowerSection}>
                    {/* TODO Add nav rail */}
                    <div className={styleClasses.mainContent} onScroll={this._handleScroll}>
                        {this.props.children}
                    </div>
                </div>
                <LoadingIndicatorOverlay />
            </div>
        );
    }

    private _handleScroll(event: UIEvent): void {
        const scrollAmount = (event.target as Element)?.scrollTop;
        const appBarElevated = scrollAmount > ThemeConstants.AppBarElevatedScrollThreshold;
        if (appBarElevated !== this.state.appBarElevated) {
            this.setState({ appBarElevated });
        }
    }

});

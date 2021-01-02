import { Theme, withStyles } from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles/withStyles';
import { RouteLinkDefinition, RouteLinkDefinitions, WithStylesProps } from 'internal';
import React, { PureComponent, ReactNode } from 'react';
import { RouteComponentProps as ReactRouteComponentProps, withRouter } from 'react-router-dom';
import { ThemeConstants } from 'styles';
import { ThemeUtils } from 'utils';
import { AppBarLink } from './app-bar-link.component';

type Props = {
    links: RouteLinkDefinitions;
} & ReactRouteComponentProps & WithStylesProps;

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        height: ThemeUtils.spacingInPixels(theme, ThemeConstants.AppBarHeightScale),
        margin: theme.spacing(0, 2)
    }
} as StyleRules);

export const AppBarLinks = withRouter(withStyles(style)(class extends PureComponent<Props> {

    render(): ReactNode {
        return (
            <div className={this.props.classes.root}>
                {this.props.links.map(this._renderLink.bind(this))}
            </div>
        );
    }

    private _renderLink(link: RouteLinkDefinition): ReactNode {
        return <AppBarLink active={this._isLinkActive(link)} link={link} />;
    }

    private _isLinkActive(link: RouteLinkDefinition): boolean {
        if (!link.route) {
            return false;
        }
        if (link.exact) {
            return this.props.location?.pathname === link.route;
        } else {
            return this.props.location?.pathname.startsWith(link.route);
        }
    }

}));
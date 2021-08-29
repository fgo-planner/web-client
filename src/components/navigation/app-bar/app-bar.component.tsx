import { Paper, StyleRules, Theme, withStyles } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';
import { PureComponent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../../services/authentication/auth.service';
import { BasicUser, UserService } from '../../../services/data/user/user.service';
import { AppBarService } from '../../../services/user-interface/app-bar.service';
import { ThemeConstants } from '../../../styles/theme-constants';
import { Nullable, UserInfo, WithStylesProps } from '../../../types/internal';
import { ThemeBackground } from '../../theme/theme-background.component';
import { AppBarAuthenticatedUser } from './authenticated/app-bar-authenticated-user.component';
import { AppBarGuestUser } from './guest/app-bar-guest-user.component';

type Props = WithStylesProps;

type State = {
    currentUser: BasicUser | null;
    elevated?: boolean;
};

const style = (theme: Theme) => ({
    root: {
        height: theme.spacing(ThemeConstants.AppBarHeightScale),
        backgroundColor: theme.palette.background.default,
        transition: 'box-shadow 200ms 50ms linear',
    },
    noElevation: {
        // Simulates 1px solid border
        // boxShadow: `0px 1px 0px ${theme.palette.divider}`
        boxShadow: 'none'
    },
    backgroundImage: {
        height: theme.spacing(ThemeConstants.AppBarHeightScale),
    },
    contents: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: theme.spacing(4)
    },
    title: {
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontSize: '24px',
        color: theme.palette.text.primary,
        textDecoration: 'none',
        marginRight: theme.spacing(6),
        [theme.breakpoints.down('md')]: {
            display: 'none'
        },
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'AppBar'
};

/**
 * The app bar component.
 */
export const AppBar = withStyles(style, styleOptions)(class extends PureComponent<Props, State> {

    private _onCurrentUserChangeSubscription!: Subscription;

    private _onElevatedChangeSubscription!: Subscription;

    constructor(props: Props) {
        super(props);

        this.state = {
            currentUser: null,
        };
    }

    componentDidMount(): void {
        this._onCurrentUserChangeSubscription = AuthenticationService.onCurrentUserChange
            .subscribe(this._handleCurrentUserChange.bind(this));
        this._onElevatedChangeSubscription = AppBarService.onElevatedChange
            .subscribe(elevated => this.setState({ elevated }));
    }

    componentWillUnmount(): void {
        this._onCurrentUserChangeSubscription.unsubscribe();
        this._onElevatedChangeSubscription.unsubscribe();
    }

    render(): ReactNode {
        const { classes } = this.props;
        const { currentUser, elevated } = this.state;
        const classNames = clsx(classes.root, !elevated && classes.noElevation);
        return (
            <Paper
                className={classNames}
                elevation={ThemeConstants.AppBarElevatedElevation}
                square={true}
            >
                <ThemeBackground className={classes.backgroundImage} />
                <div className={classes.contents}>
                    {/* TODO Add logo */}
                    <Link className={classes.title} to="/">
                        FGO Servant Planner
                    </Link>
                    {currentUser ?
                        <AppBarAuthenticatedUser currentUser={currentUser} /> :
                        <AppBarGuestUser />
                    }
                </div>
            </Paper>
        );
    }

    private async _handleCurrentUserChange(userInfo: Nullable<UserInfo>): Promise<void> {
        if (userInfo) {
            // TODO Handle error
            const currentUser = await UserService.getCurrentUser();
            this.setState({ currentUser });
        } else {
            this.setState({ currentUser: null });
        }
    }

});

import { Avatar, Box, fade, IconButton, StyleRules, Theme, withStyles } from '@material-ui/core';
import { Delete as DeleteIcon, Edit as EditIcon } from '@material-ui/icons';
import { GameServantConstants } from 'app-constants';
import { GameServant, MasterServant } from 'data';
import { ReadonlyRecord, WithStylesProps } from 'internal';
import React, { PureComponent, ReactNode } from 'react';
import { GameServantService } from 'services';
import { ThemeConstants } from 'styles';
import { Container as Injectables } from 'typedi';

type Props = {
    masterServants: MasterServant[];
    editMode: boolean;
    viewLayout?: any; // TODO Make use of this
    onEditServant?: (servant: MasterServant) => void;
    onDeleteServant?: (servant: MasterServant) => void;
} & WithStylesProps;

type State = {
    gameServantMap: ReadonlyRecord<number, Readonly<GameServant>>;
};

const style = (theme: Theme) => ({
    root: {
        minWidth: `${theme.breakpoints.width('lg')}px`,
    },
    header: {
        display: 'flex',
        padding: theme.spacing(8, 0, 4, 0),
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontWeight: 500,
        textAlign: 'center',
    },
    row: {
        display: 'flex',
        alignContent: 'center',
        alignItems: 'center',
        height: '64px',
        borderTop: `1px solid ${theme.palette.divider}`,
        '&:hover': {
            background: fade(theme.palette.text.primary, 0.07)
        }
    },
    skillLevels: {
        display: 'flex',
        textAlign: 'center',
        justifyContent: 'center'
    },
    skillLevel: {
        width: '20px'
    },
    actions: {
        display: 'flex',
        justifyContent: 'center'
    }
} as StyleRules);

export const MasterServantsListView = withStyles(style)(class extends PureComponent<Props, State> {

    private readonly _viewModeColumnWidths = {
        name: '35%',
        noblePhantasmLevel: '5%',
        level: '12%',
        fouHp: '12%',
        fouAtk: '12%',
        skillLevels: '12%',
        bond: '12%',
        actions: '120px'
    };

    private _gameServantService = Injectables.get(GameServantService);

    constructor(props: Props) {
        super(props);

        this.state = {
            gameServantMap: {}
        };

        this._renderServant = this._renderServant.bind(this);
    }

    componentDidMount() {
        this._gameServantService.getServantsMap().then(gameServantMap => {
            this.setState({ gameServantMap });
        });
    }

    render(): ReactNode {
        const { classes, masterServants } = this.props;
        return (
            <div className={classes.root}>
                {this._renderHeader()}
                {masterServants.map(this._renderServant)}
            </div>
        );
    }

    private _renderHeader(): ReactNode {
        const { classes } = this.props;
        return (
            <div className={classes.header}>
                <Box flex={this._viewModeColumnWidths.name} textAlign="left" pl={4}>
                    Servant
                </Box>
                <Box flex={this._viewModeColumnWidths.noblePhantasmLevel}>
                    NP
                </Box>
                <Box flex={this._viewModeColumnWidths.level}>
                    Level
                </Box>
                <Box flex={this._viewModeColumnWidths.fouHp}>
                    Fou (HP)
                </Box>
                <Box flex={this._viewModeColumnWidths.fouAtk}>
                    Fou (Attack)
                </Box>
                <Box flex={this._viewModeColumnWidths.skillLevels}>
                    Skills
                </Box>
                <Box flex={this._viewModeColumnWidths.bond}>
                    Bond
                </Box>
                <Box width={this._viewModeColumnWidths.actions}>
                    Actions
                </Box>
            </div>
        );
    }

    private _renderServant(masterServant: MasterServant): ReactNode {
        // TODO Clean this up
        const { classes } = this.props;
        const { gameServantMap } = this.state;
        const servant = gameServantMap[masterServant.gameId];
        if (!servant) {
            return (
                <div key={masterServant.instanceId}>
                    Unknown servant ID {masterServant.gameId}
                </div>
            );
        }
        return(
            <div key={masterServant.instanceId} className={classes.row}>
                {this._renderServantName(masterServant, servant)}
                <Box flex={this._viewModeColumnWidths.noblePhantasmLevel} textAlign="center">
                    {masterServant.noblePhantasmLevel}
                </Box>
                <Box flex={this._viewModeColumnWidths.level} textAlign="center">
                    {masterServant.level}
                </Box>
                <Box flex={this._viewModeColumnWidths.fouHp} textAlign="center">
                    {masterServant.fouHp === undefined ? '\u2014' : `+${masterServant.fouHp }`}
                </Box>
                <Box flex={this._viewModeColumnWidths.fouAtk} textAlign="center">
                    {masterServant.fouAtk === undefined ? '\u2014' : `+${masterServant.fouAtk }`}
                </Box>
                {this._renderSkillLevels(masterServant)}
                <Box flex={this._viewModeColumnWidths.bond} textAlign="center">
                    {masterServant.bond ?? '\u2014'}
                </Box>
                {this._renderActionButtons(masterServant)}
            </div>
        );
    }

    private _renderServantName(masterServant: MasterServant, servant: GameServant) {
        const { ascensionLevel } = masterServant;
        const ascIdx = ascensionLevel < 3 ? ascensionLevel : ascensionLevel - 1;
        const imageUrl = `${GameServantConstants.ThumbnailBaseUrl}${servant._id}${ascIdx}${GameServantConstants.ThumbnailExtension}`;
        return (
            <Box flex={this._viewModeColumnWidths.name} pl={4} display="flex" alignItems="center">
                <Avatar src={imageUrl} variant="rounded" />
                <Box pl={4}>
                    {servant.name}
                </Box>
            </Box>
        );
    }

    private _renderSkillLevels(masterServant: MasterServant) {
        const { classes } = this.props;
        return (
            <Box className={classes.skillLevels} flex={this._viewModeColumnWidths.skillLevels}>
                <Box className={classes.skillLevel}>
                    {masterServant.skillLevels[1] ?? '\u2013'}
                </Box>
                <div>/</div>
                <Box className={classes.skillLevel}>
                    {masterServant.skillLevels[2] ?? '\u2013'}
                </Box>
                <div>/</div>
                <Box className={classes.skillLevel}>
                    {masterServant.skillLevels[3] ?? '\u2013'}
                </Box>
            </Box>
        );
    }

    private _renderActionButtons(masterServant: MasterServant) {
        const { classes, onEditServant, onDeleteServant } = this.props;
        return (
            <Box className={classes.actions} width={this._viewModeColumnWidths.actions}>
                <IconButton color="primary" onClick={e => onEditServant && onEditServant(masterServant)}>
                    <EditIcon />
                </IconButton>
                <IconButton color="secondary" onClick={e => onDeleteServant && onDeleteServant(masterServant)}>
                    <DeleteIcon />
                </IconButton>
            </Box>
        );
    }

});
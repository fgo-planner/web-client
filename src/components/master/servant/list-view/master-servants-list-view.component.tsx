import { Box, IconButton, StyleRules, Theme, withStyles } from '@material-ui/core';
import { Edit as EditIcon, Delete as DeleteIcon } from '@material-ui/icons';
import { GameServant, MasterServant } from 'data';
import { ReadonlyRecord, WithStylesProps } from 'internal';
import React, { PureComponent, ReactNode } from 'react';
import { GameServantService } from 'services';
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
        maxWidth: `${theme.breakpoints.width('md')}px`,
        padding: theme.spacing(0, 4),
        margin: 'auto'
    },
    row: {
        lineHeight: '48px',
        '& > div': {
            marginRight: theme.spacing(4)
        }
    }
} as StyleRules);

export const MasterServantsListView = withStyles(style)(class extends PureComponent<Props, State> {

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
        const { masterServants } = this.props;
        return (
            <div>
                {masterServants.map(this._renderServant)}
            </div>
        );
    }

    private _renderServant(masterServant: MasterServant): ReactNode {
        // TODO Clean this up
        const { classes, editMode, onEditServant, onDeleteServant } = this.props;
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
            <Box className={classes.row} key={masterServant.instanceId} display="flex">
                <div>{servant.name}</div>
                <div>NP{masterServant.noblePhantasmLevel}</div>
                <div>Level: {masterServant.level}</div>
                <div>Fou (HP/ATK): {masterServant.fouHp ?? '\u2014'}/{masterServant.fouAtk ?? '\u2014'}</div>
                <div>Skills: {masterServant.skillLevels[1] ?? '\u2014'}/{masterServant.skillLevels[2] ?? '\u2014'}/{masterServant.skillLevels[3] ?? '\u2014'}</div>
                <div>Bond: {masterServant.bond ?? '\u2014'}</div>
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
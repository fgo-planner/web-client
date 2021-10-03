import { GameServant, MasterServant } from '@fgo-planner/types';
import { Theme } from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { GameServantClassIcon } from '../../../../../../components/game/servant/game-servant-class-icon.component';
import { GameServantThumbnail } from '../../../../../../components/game/servant/game-servant-thumbnail.component';
import { MasterServantUtils } from '../../../../../../utils/master/master-servant.utils';
import { MasterServantListColumnWidths as ColumnWidths } from './master-servant-list-columns';

type Props = {
    servant: Readonly<GameServant>;
    masterServant: MasterServant;
    editMode?: boolean;
    openLinksInNewTab?: boolean;
};

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        flex: ColumnWidths.label,
        /**
         * This fixes text truncation issues inside flex box.
         * @see https://css-tricks.com/flexbox-truncated-text/
         */
        minWidth: 0,
        '& > :not(:first-child)': {
            paddingLeft: theme.spacing(4)
        }
    },
    rarity: {
        minWidth: 24
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantListRowLabel'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterServantListRowLabel = React.memo(({ servant, masterServant, openLinksInNewTab }: Props) => {
    const classes = useStyles();
    const { ascension } = masterServant;

    const artStage = MasterServantUtils.getArtStage(ascension);

    return (
        <div className={classes.root}>
            <GameServantThumbnail
                variant="rounded"
                size={48}
                servant={servant}
                stage={artStage}
                enableLink
                openLinkInNewTab={openLinksInNewTab}
            />
            <GameServantClassIcon
                servantClass={servant.class}
                rarity={servant.rarity}
            />
            <div className={classes.rarity}>
                {`${servant.rarity} \u2605`}
            </div>
            <div className="truncate">
                {servant.name}
            </div>
        </div>
    );
    
});

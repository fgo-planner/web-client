import { Box, makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React from 'react';
import { GameServantClassIcon } from '../../../../../../components/game/servant/game-servant-class-icon.component';
import { GameServantThumbnail } from '../../../../../../components/game/servant/game-servant-thumbnail.component';
import { GameServant, MasterServant } from '../../../../../../types';
import { MasterServantUtils } from '../../../../../../utils/master/master-servant.utils';
import { ViewModeColumnWidths } from './master-servant-list-column-widths';

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
        '& > :not(:first-child)': {
            paddingLeft: theme.spacing(4)
        }
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantListRowLabel'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterServantListRowLabel = React.memo(({ servant, masterServant, openLinksInNewTab }: Props) => {
    const classes = useStyles();
    const { ascensionLevel } = masterServant;

    const artStage = MasterServantUtils.getArtStage(ascensionLevel);

    return (
        <Box className={classes.root} flex={ViewModeColumnWidths.label}>
            <GameServantThumbnail
                variant="rounded"
                size={56}
                servant={servant}
                stage={artStage}
                enableLink
                openLinkInNewTab={openLinksInNewTab}
            />
            <GameServantClassIcon
                servantClass={servant.class}
                rarity={servant.rarity}
            />
            <div className="rarity">
                {`${servant.rarity} \u2605`}
            </div>
            <div>
                {servant.name}
            </div>
        </Box>
    );
    
});

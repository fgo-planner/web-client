import { Box, makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { GameServantClassIcon, GameServantThumbnail } from 'components';
import { GameServant, MasterServant } from 'data';
import React from 'react';
import { MasterServantUtils } from 'utils';
import { ViewModeColumnWidths } from './master-servant-list-column-widths';

type Props = {
    servant: Readonly<GameServant>;
    masterServant: MasterServant;
    editMode?: boolean;
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

export const MasterServantListRowLabel = React.memo(({ servant, masterServant, editMode }: Props) => {
    const classes = useStyles();
    const { ascensionLevel } = masterServant;

    const artStage = MasterServantUtils.getArtStage(ascensionLevel);

    return (
        <Box className={classes.root} flex={ViewModeColumnWidths.name}>
            <GameServantThumbnail
                variant="rounded"
                size={56}
                servant={servant}
                stage={artStage}
                enableLink
                openInNewTab={editMode}
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

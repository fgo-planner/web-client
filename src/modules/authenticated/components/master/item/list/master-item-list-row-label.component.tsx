import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { Fragment } from 'react';
import { GameItemThumbnail } from '../../../../../../components/game/item/game-item-thumbnail.component';
import { ThemeConstants } from '../../../../../../styles/theme-constants';
import { GameItem } from '../../../../../../types';

type Props = {
    item: GameItem;
};

const style = (theme: Theme) => ({
    itemName: {
        padding: theme.spacing(0, 4),
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontSize: '14px',
        fontWeight: 500
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterItemListRowLabel'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterItemListRowLabel = React.memo(({ item }: Props) => {
    const classes = useStyles();
    return (
        <Fragment>
            <GameItemThumbnail
                item={item}
                size={52}
                showBackground
                enableLink
            />
            <div className={classes.itemName}>
                {item.name}
            </div>
        </Fragment>
    );
});

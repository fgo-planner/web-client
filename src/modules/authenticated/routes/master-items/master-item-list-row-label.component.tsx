import { GameItem } from '@fgo-planner/types';
import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React, { Fragment } from 'react';
import { GameItemThumbnail } from '../../../../components/game/item/game-item-thumbnail.component';

type Props = {
    item: GameItem;
    editMode?: boolean;
};

const style = (theme: Theme) => ({
    itemName: {
        padding: theme.spacing(0, 4)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterItemListRowLabel'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterItemListRowLabel = React.memo(({ item, editMode }: Props) => {
    const classes = useStyles();
    return (
        <Fragment>
            <GameItemThumbnail
                item={item}
                size={42}
                showBackground
                enableLink={!editMode}
            />
            <div className={classes.itemName}>
                {item.name}
            </div>
        </Fragment>
    );
});

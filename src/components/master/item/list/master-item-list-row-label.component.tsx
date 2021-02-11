import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import { AssetConstants } from 'app-constants';
import { GameItem } from 'data';
import React, { Fragment } from 'react';
import { ThemeConstants } from 'styles';

type Props = {
    item: GameItem;
};

const ImageBaseUrl = AssetConstants.ItemImageBaseUrl;

const style = (theme: Theme) => ({
    itemIcon: {
        width: '48px',
        height: '48px'
    },
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
            <img className={classes.itemIcon}
                 src={`${ImageBaseUrl}/${item._id}.png`}
                 alt={item.name}
            />
            <div className={classes.itemName}>
                {item.name}
            </div>
        </Fragment>
    );
});

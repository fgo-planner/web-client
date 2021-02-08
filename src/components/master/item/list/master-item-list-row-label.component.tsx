import { makeStyles, StyleRules, Theme } from '@material-ui/core';
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

const useStyles = makeStyles(style);

export const MasterItemListRowLabel = React.memo((props: Props) => {
    const { item } = props;
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
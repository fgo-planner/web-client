import { StyleRules, Theme, withStyles } from '@material-ui/core';
import { GameItemConstants } from 'app-constants';
import { GameItem } from 'data';
import { WithStylesProps } from 'internal';
import React, { Fragment } from 'react';
import { ThemeConstants } from 'styles';

type Props = {
    item: GameItem;
} & WithStylesProps;

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

export const MasterItemsListViewRowLabel = React.memo(withStyles(style)((props: Props) => {
    const { classes, item } = props;
    return (
        <Fragment>
            <img className={classes.itemIcon}
                 src={`${GameItemConstants.ImageBaseUrl}${item._id}${GameItemConstants.ImageExtension}`}
                 alt={item.name}
            />
            <div className={classes.itemName}>
                {item.name}
            </div>
        </Fragment>
    );
}));
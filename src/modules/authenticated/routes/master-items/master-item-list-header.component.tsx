import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import React from 'react';
import { ThemeConstants } from '../../../../styles/theme-constants';

type Props = {
    categoryLabel: string;
    showQuantityLabel?: boolean;
    viewLayout?: any; // TODO Make use of this
};

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: theme.spacing(4, 8, 4, 6),
        fontFamily: ThemeConstants.FontFamilyGoogleSans,
        fontWeight: 500,
        fontSize: '0.875rem'
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterItemListHeader'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterItemListHeader = React.memo(({ categoryLabel, showQuantityLabel }: Props) => {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <div>
                {categoryLabel}
            </div>
            {showQuantityLabel && <div>
                Quantity
            </div>}
        </div>
    );
});

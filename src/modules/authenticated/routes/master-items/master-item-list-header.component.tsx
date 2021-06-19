import { makeStyles, StyleRules, Theme } from '@material-ui/core';
import { WithStylesOptions } from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';
import React from 'react';
import { ThemeConstants } from '../../../../styles/theme-constants';

type Props = {
    categoryLabel: string;
    showQuantityLabel?: boolean;
    editMode?: boolean;
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
    },
    editMode: {
        paddingLeft: theme.spacing(4 + 5)
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterItemListHeader'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterItemListHeader = React.memo(({ categoryLabel, showQuantityLabel, editMode }: Props) => {
    const classes = useStyles();
    const rootClassName = clsx(classes.root, editMode && classes.editMode);
    return (
        <div className={rootClassName}>
            <div className={classes.label}>
                {categoryLabel}
            </div>
            {showQuantityLabel && <div className={classes.quantity}>
                Quantity
            </div>}
        </div>
    );
});

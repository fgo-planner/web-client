

import { GameItem } from '@fgo-planner/types';
import { Theme } from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React from 'react';
import { ComponentStyleProps } from '../../../types/internal';
import { GameItemThumbnail } from './game-item-thumbnail.component';

type Props = {
    item: Readonly<GameItem>;
    quantity: number;
    size?: string | number;
} & ComponentStyleProps;

const DefaultThumbnailSize = 42;

const style = (theme: Theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center'
    },
    quantity: {
        width: 24,
        marginRight: theme.spacing(2),
        textAlign: 'right'
    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'GameItemQuantity'
};

const useStyles = makeStyles(style, styleOptions);

export const GameItemQuantity = React.memo(({ className, item, quantity, size }: Props) => {

    const classes = useStyles();

    const thumbnailSize = size || DefaultThumbnailSize;

    return (
        <div className={clsx(classes.root, className)}>
            <div className={classes.quantity}>{quantity}</div>
            <GameItemThumbnail item={item} size={thumbnailSize} showBackground />
        </div>
    );

});

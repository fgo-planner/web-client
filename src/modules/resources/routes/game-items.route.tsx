import { fade, makeStyles, StyleRules, Theme, Typography } from '@material-ui/core';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GameItemThumbnail } from '../../../components/game/item/game-item-thumbnail.component';
import { LayoutPanelContainer } from '../../../components/layout/layout-panel-container.component';
import { LayoutPanelScrollable } from '../../../components/layout/layout-panel-scrollable.component';
import { PageTitle } from '../../../components/text/page-title.component';
import { useElevateAppBarOnScroll } from '../../../hooks/use-elevate-app-bar-on-scroll.hook';
import { GameItemList, GameItemService } from '../../../services/data/game/game-item.service';

const style = (theme: Theme) => ({
    header: {
        height: 64,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: theme.palette.divider,
    },
    row: {
        height: 52,
        padding: theme.spacing(0, 4),
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: theme.palette.divider,
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderRightColor: theme.palette.divider,
        '&:hover': {
            background: fade(theme.palette.text.primary, 0.07)
        }
    },
    footer: {
        height: 64,
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: theme.palette.divider,
    }
} as StyleRules);

// const styleOptions: WithStylesOptions<Theme> = {
//     classNamePrefix: 'LayoutPanelContainer'
// };

const useStyles = makeStyles(style);

export const GameItemsRoute = React.memo(() => {
    const classes = useStyles();

    const [gameItems, setGameItems] = useState<GameItemList>([]);

    useEffect(() => {
        GameItemService.getItems()
            .then(setGameItems);
    }, []);

    // const scrollContainer = useElevateAppBarOnScroll();

    return (
        <div className="flex column full-height">
            <PageTitle>Item List</PageTitle>
            <LayoutPanelScrollable
                className="m-4"
                headerContents={
                    <div className={classes.header}>HEADER TEST</div>
                }
            >
                {gameItems.map((item, key) => (
                    <div key={key} className={clsx(classes.row, 'flex align-center')}>
                        <GameItemThumbnail
                            item={item}
                            size={42}
                            showBackground
                            enableLink
                        />
                        <div className="px-4" style={{ fontSize: '0.875rem' }}>
                            {item.name}
                        </div>
                    </div>
                ))}
            </LayoutPanelScrollable>
        </div>
    );
});

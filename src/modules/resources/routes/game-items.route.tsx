import { Box, SystemStyleObject, Theme } from '@mui/system';
import React from 'react';
import { GameItemThumbnail } from '../../../components/game/item/game-item-thumbnail.component';
import { LayoutPanelScrollable } from '../../../components/layout/layout-panel-scrollable.component';
import { StaticListRowContainer } from '../../../components/list/static-list-row-container.component';
import { PageTitle } from '../../../components/text/page-title.component';
import { useGameItemList } from '../../../hooks/data/use-game-item-list.hook';

const StyleClassPrefix = 'GameItems';

const StyleProps = (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    [`& .${StyleClassPrefix}-header`]: {
        height: 64,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: 'divider',
    },
    [`& .${StyleClassPrefix}-footer`]: {
        height: 64,
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: 'divider',
    }
} as SystemStyleObject<Theme>);

export const GameItemsRoute = React.memo(() => {

    const gameItems = useGameItemList();

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <PageTitle>Item List</PageTitle>
            <LayoutPanelScrollable className='m-4 scrollbar-track-border'>
                {gameItems?.map((gameItem, index) => (
                    <StaticListRowContainer key={index} borderTop={!!index}>
                        <div className='flex align-center'>
                            <GameItemThumbnail
                                gameItem={gameItem}
                                size={52}
                                showBackground
                                enableLink
                            />
                            <div className='px-4' style={{ fontSize: '0.875rem' }}>
                                {gameItem.name}
                            </div>
                        </div>
                    </StaticListRowContainer>
                ))}
            </LayoutPanelScrollable>
        </Box>
    );

});

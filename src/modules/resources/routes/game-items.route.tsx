import React from 'react';
import { GameItemThumbnail } from '../../../components/game/item/game-item-thumbnail.component';
import { LayoutContentSection } from '../../../components/layout/layout-content-section.component';
import { StaticListRowContainer } from '../../../components/list/static-list-row-container.component';
import { AppBarElevateOnScroll } from '../../../components/navigation/app-bar/app-bar-elevate-on-scroll.component';
import { PageTitle } from '../../../components/text/page-title.component';
import { useGameItemList } from '../../../hooks/data/use-game-item-list.hook';

const StyleClassPrefix = 'GameItems';

export const GameItemsRoute = React.memo(() => {

    const gameItems = useGameItemList();

    return (
        <AppBarElevateOnScroll className={`${StyleClassPrefix}-root`}>
            <PageTitle>Item List</PageTitle>
            <LayoutContentSection className='m-4'>
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
            </LayoutContentSection>
        </AppBarElevateOnScroll>
    );

});

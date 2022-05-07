import React from 'react';
import { GameItemThumbnail } from '../../../components/game/item/game-item-thumbnail.component';
import { LayoutContentSection } from '../../../components/layout/layout-content-section.component';
import { LayoutPageScrollable } from '../../../components/layout/layout-page-scrollable.component';
import { StaticListRowContainer } from '../../../components/list/static-list-row-container.component';
import { PageTitle } from '../../../components/text/page-title.component';
import { useGameItemList } from '../../../hooks/data/use-game-item-list.hook';
import { useElevateAppBarOnScroll } from '../../../hooks/user-interface/use-elevate-app-bar-on-scroll.hook';

const StyleClassPrefix = 'GameItems';

export const GameItemsRoute = React.memo(() => {

    const gameItems = useGameItemList();

    const scrollContainer = useElevateAppBarOnScroll();

    return (
        <LayoutPageScrollable className={`${StyleClassPrefix}-root`} scrollContainerRef={scrollContainer}>
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
        </LayoutPageScrollable>
    );

});

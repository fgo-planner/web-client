import React from 'react';
import { GameServantThumbnail } from '../../../components/game/servant/game-servant-thumbnail.component';
import { LayoutPageScrollable } from '../../../components/layout/layout-page-scrollable.component';
import { LayoutPanelContainer } from '../../../components/layout/layout-panel-container.component';
import { StaticListRowContainer } from '../../../components/list/static-list-row-container.component';
import { PageTitle } from '../../../components/text/page-title.component';
import { useGameServantList } from '../../../hooks/data/use-game-servant-list.hook';
import { useElevateAppBarOnScroll } from '../../../hooks/user-interface/use-elevate-app-bar-on-scroll.hook';

export const GameServantsRoute = React.memo(() => {

    const gameServants = useGameServantList();

    const scrollContainer = useElevateAppBarOnScroll();

    return (
        <LayoutPageScrollable scrollContainerRef={scrollContainer}>
            <PageTitle>Servant List</PageTitle>
            <LayoutPanelContainer className="m-4">
                {gameServants?.map((servant, index) => (
                    <StaticListRowContainer key={index} borderTop={!!index}>
                        <div className='flex align-center'>
                            <GameServantThumbnail
                                gameServant={servant}
                                size={52}
                                enableLink
                            />
                            <div className='px-4' style={{ fontSize: '0.875rem' }}>
                                {servant.name}
                            </div>
                        </div>
                    </StaticListRowContainer>
                ))}
            </LayoutPanelContainer>
        </LayoutPageScrollable>
    );

});

import React from 'react';
import { LayoutPageScrollable } from '../../../components/layout/layout-page-scrollable.component';
import { LayoutPanelContainer } from '../../../components/layout/layout-panel-container.component';
import { PageTitle } from '../../../components/text/page-title.component';
import { useGameServantList } from '../../../hooks/data/use-game-servant-list.hook';
import { useElevateAppBarOnScroll } from '../../../hooks/user-interface/use-elevate-app-bar-on-scroll.hook';

export const GameServantsRoute = React.memo(() => {

    const gameServants = useGameServantList();

    const scrollContainer = useElevateAppBarOnScroll();

    return (
        <LayoutPageScrollable scrollContainerRef={scrollContainer}>
            <PageTitle>Servants</PageTitle>
            <LayoutPanelContainer className="m-4">
                {gameServants?.map((servant, key) => (
                    <div key={key}>
                        {servant.collectionNo} {servant.name}
                    </div>
                ))}
            </LayoutPanelContainer>
        </LayoutPageScrollable>
    );
    
});

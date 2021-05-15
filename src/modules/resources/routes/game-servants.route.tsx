import React, { useEffect, useState } from 'react';
import { LayoutPageScrollable } from '../../../components/layout/layout-page-scrollable.component';
import { LayoutPanelContainer } from '../../../components/layout/layout-panel-container.component';
import { PageTitle } from '../../../components/text/page-title.component';
import { useElevateAppBarOnScroll } from '../../../hooks/use-elevate-app-bar-on-scroll.hook';
import { GameServantList, GameServantService } from '../../../services/data/game/game-servant.service';

export const GameServantsRoute = React.memo(() => {
    const [gameServants, setGameServants] = useState<GameServantList>([]);

    useEffect(() => {
        GameServantService.getServants()
            .then(setGameServants);
    }, []);

    const scrollContainer = useElevateAppBarOnScroll();

    return (
        <LayoutPageScrollable scrollContainerRef={scrollContainer}>
            <PageTitle>Servants</PageTitle>
            <LayoutPanelContainer className="m-4">
                {gameServants.map((servant, key) => (
                    <div key={key}>
                        {servant.collectionNo} {servant.name}
                    </div>
                ))}
            </LayoutPanelContainer>
        </LayoutPageScrollable>
    );
});

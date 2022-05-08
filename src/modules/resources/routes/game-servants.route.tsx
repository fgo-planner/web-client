import React from 'react';
import { GameServantThumbnail } from '../../../components/game/servant/game-servant-thumbnail.component';
import { LayoutContentSection } from '../../../components/layout/layout-content-section.component';
import { StaticListRowContainer } from '../../../components/list/static-list-row-container.component';
import { AppBarElevateOnScroll } from '../../../components/navigation/app-bar/app-bar-elevate-on-scroll.component';
import { PageTitle } from '../../../components/text/page-title.component';
import { useGameServantList } from '../../../hooks/data/use-game-servant-list.hook';

const StyleClassPrefix = 'GameServants';

export const GameServantsRoute = React.memo(() => {

    const gameServants = useGameServantList();

    return (
        <AppBarElevateOnScroll className={`${StyleClassPrefix}-root`}>
            <PageTitle>Servant List</PageTitle>
            <LayoutContentSection className='m-4'>
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
            </LayoutContentSection>
        </AppBarElevateOnScroll>
    );

});

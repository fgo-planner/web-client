import { GameServant, MasterServant } from '@fgo-planner/types';
import React from 'react';
import { GameServantClassIcon } from '../../../../../../components/game/servant/game-servant-class-icon.component';
import { GameServantThumbnail } from '../../../../../../components/game/servant/game-servant-thumbnail.component';
import { Immutable } from '../../../../../../types/internal';
import { MasterServantUtils } from '../../../../../../utils/master/master-servant.utils';

type Props = {
    gameServant: Immutable<GameServant>;
    masterServant: MasterServant;
    openLinksInNewTab?: boolean;
};

export const StyleClassPrefix = 'MasterServantListRowInfo';

export const MasterServantListRowInfo = React.memo((props: Props) => {

    const {
        gameServant,
        masterServant: {
            ascension
        },
        openLinksInNewTab
    } = props;

    const artStage = MasterServantUtils.getArtStage(ascension);

    return (
        <div className={`${StyleClassPrefix}-root`}>
            <GameServantThumbnail
                variant='rounded'
                size={48}
                gameServant={gameServant}
                stage={artStage}
                enableLink
                openLinkInNewTab={openLinksInNewTab}
                showOpenInNewTabIndicator={openLinksInNewTab}
            />
            <GameServantClassIcon
                className={`${StyleClassPrefix}-class-icon`}
                servantClass={gameServant.class}
                rarity={gameServant.rarity}
            />
            <div className={`${StyleClassPrefix}-rarity`}>
                {`${gameServant.rarity} \u2605`}
            </div>
            <div className='truncate'>
                {gameServant.name}
            </div>
        </div>
    );
    
});

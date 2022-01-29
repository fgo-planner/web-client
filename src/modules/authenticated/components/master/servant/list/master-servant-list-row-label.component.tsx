import { GameServant, MasterServant } from '@fgo-planner/types';
import React from 'react';
import { GameServantClassIcon } from '../../../../../../components/game/servant/game-servant-class-icon.component';
import { GameServantThumbnail } from '../../../../../../components/game/servant/game-servant-thumbnail.component';
import { Immutable } from '../../../../../../types/internal';
import { MasterServantUtils } from '../../../../../../utils/master/master-servant.utils';

type Props = {
    servant: Immutable<GameServant>;
    masterServant: MasterServant;
    editMode?: boolean;
    openLinksInNewTab?: boolean;
};

export const StyleClassPrefix = 'MasterServantListRowLabel';

export const MasterServantListRowLabel = React.memo(({ servant, masterServant, openLinksInNewTab }: Props) => {

    const { ascension } = masterServant;

    const artStage = MasterServantUtils.getArtStage(ascension);

    return (
        <div className={`${StyleClassPrefix}-root`}>
            <GameServantThumbnail
                variant="rounded"
                size={48}
                gameServant={servant}
                stage={artStage}
                enableLink
                openLinkInNewTab={openLinksInNewTab}
            />
            <GameServantClassIcon
                servantClass={servant.class}
                rarity={servant.rarity}
            />
            <div className={`${StyleClassPrefix}-rarity`}>
                {`${servant.rarity} \u2605`}
            </div>
            <div className="truncate">
                {servant.name}
            </div>
        </div>
    );
    
});

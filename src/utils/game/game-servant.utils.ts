import { GameServantClass } from '@fgo-planner/types';
import { GameServantClassSimplified } from '../../types/internal';

export class GameServantUtils {

    static convertToSimplifiedClass(servantClass: GameServantClass): GameServantClassSimplified {
        switch (servantClass) {
        case GameServantClass.Saber:
            return GameServantClassSimplified.Saber;
        case GameServantClass.Archer:
            return GameServantClassSimplified.Archer;
        case GameServantClass.Lancer:
            return GameServantClassSimplified.Lancer;
        case GameServantClass.Rider:
            return GameServantClassSimplified.Rider;
        case GameServantClass.Caster:
            return GameServantClassSimplified.Caster;
        case GameServantClass.Assassin:
            return GameServantClassSimplified.Assassin;
        case GameServantClass.Berserker:
            return GameServantClassSimplified.Berserker;
        default:
            return GameServantClassSimplified.Extra;
        }
    }

}

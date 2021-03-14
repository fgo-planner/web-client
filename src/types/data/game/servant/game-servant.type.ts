import { Entity } from '../../entity.type';
import { ExternalLink } from '../../external-link.type';
import { GameServantAttribute } from './game-servant-attribute.enum';
import { GameServantClass } from './game-servant-class.enum';
import { GameServantEnhancement } from './game-servant-enhancement.type';
import { GameServantGender } from './game-servant-gender.enum';
import { GameServantGrowthCurve } from './game-servant-growth-curve.enum';
import { GameServantRarity } from './game-servant-rarity.type';

export type GameServant = Entity<number> & {

    collectionNo: number;

    name?: string;

    nameJp?: string;

    class: GameServantClass;

    rarity: GameServantRarity;

    cost: number;

    /**
     * The natural level cap of the servant.
     */
    maxLevel: number;

    gender: GameServantGender;

    attribute: GameServantAttribute;

    // TODO Add card deck

    /**
     * The servant's hit points at level 1.
     */
    hpBase: number;

    /**
     * The servant's hit points at their natural level cap.
     */
    hpMax: number;

    /**
     * The servant's attack strength at level 1.
     */
    atkBase: number;

    /**
     * The servant's attack strength at their natural level cap.
     */
    atkMax: number;

    growthCurve: GameServantGrowthCurve;

    skillMaterials: {

        1: GameServantEnhancement;

        2: GameServantEnhancement;

        3: GameServantEnhancement;

        4: GameServantEnhancement;

        5: GameServantEnhancement;

        6: GameServantEnhancement;

        7: GameServantEnhancement;

        8: GameServantEnhancement;

        9: GameServantEnhancement;

    };

    ascensionMaterials?: {

        1: GameServantEnhancement;

        2: GameServantEnhancement;

        3: GameServantEnhancement;

        4: GameServantEnhancement;

    };

    costumeMaterials?: Record<number, GameServantEnhancement>;

    metadata: {

        displayName?: string;

        fgoManagerName?: string;

        links: ExternalLink[];

    };

};

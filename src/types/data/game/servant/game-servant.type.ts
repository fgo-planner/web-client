import { Entity } from '../../entity.type';
import { ExternalLink } from '../../external-link.type';
import { GameServantAscensionMaterials } from './game-servant-ascension-materials';
import { GameServantAttribute } from './game-servant-attribute.enum';
import { GameServantClass } from './game-servant-class.enum';
import { GameServantCostume } from './game-servant-costume.type';
import { GameServantGender } from './game-servant-gender.enum';
import { GameServantGrowthCurve } from './game-servant-growth-curve.enum';
import { GameServantRarity } from './game-servant-rarity.type';
import { GameServantSkillMaterials } from './game-servant-skill-materials';

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

    skillMaterials: GameServantSkillMaterials;

    appendSkillMaterials: GameServantSkillMaterials;

    /**
     * Materials required to ascend the servant. This can be undefined because
     * some servants (Mash) don't use materials for ascension.
     */
    ascensionMaterials?: GameServantAscensionMaterials;

    costumes: Record<number, GameServantCostume>;

    metadata: {

        displayName?: string;

        fgoManagerName?: string;

        links: ExternalLink[];

    };

};

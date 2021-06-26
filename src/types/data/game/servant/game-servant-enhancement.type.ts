import { GameItemQuantity } from '../item/game-item-quantity.type';

/**
 * Material and QP cost for performing servant skill or ascension upgrade.
 */
export type GameServantEnhancement = {

    /**
     * The cost of the upgrade in QP.
     */
    qp: number;

    /**
     * Materials required for the upgrade.
     */
    materials: GameItemQuantity[];

};

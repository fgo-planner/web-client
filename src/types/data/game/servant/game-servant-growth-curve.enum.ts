/**
 * Enumeration of servant growth curve types. The enum values represent the 
 * 'base' value of each type. The actual in-game growth curve ID can be
 * computed by adding the servant's rarity value to this 'base' value. The
 * in-game growth curve IDs are as follows:
 * - 1: Linear 1★
 * - 2: Linear 2★
 * - 3: Linear 3★
 * - 4: Linear 4★
 * - 5: Linear 5★
 * - 6: Reverse S 1★
 * - 7: Reverse S 2★
 * - 8: Reverse S 3★
 * - 9: Reverse S 4★
 * - 10: Reverse S 5★
 * - 12: S 1★
 * - 12: S 2★
 * - 13: S 3★
 * - 14: S 4★
 * - 15: S 5★
 * - 21: Semi Reverse S 1★
 * - 22: Semi Reverse S 2★
 * - 23: Semi Reverse S 3★
 * - 24: Semi Reverse S 4★
 * - 25: Semi Reverse S 5★
 * - 26: Semi S 1★
 * - 27: Semi S 2★
 * - 28: Semi S 3★
 * - 29: Semi S 4★
 * - 30: Semi S 5★
 */
export enum GameServantGrowthCurve {
    Linear = 0,
    ReverseS = 5,
    S = 10,
    SemiReverseS = 20,
    SemiS = 25
}

export const GameServantGrowthCurveDisplayMap: { readonly [key in GameServantGrowthCurve]: string } = {
    [GameServantGrowthCurve.Linear]: 'Linear',
    [GameServantGrowthCurve.ReverseS]: 'Reverse S',
    [GameServantGrowthCurve.S]: 'S',
    [GameServantGrowthCurve.SemiReverseS]: 'Semi-Reverse S',
    [GameServantGrowthCurve.SemiS]: 'Semi-S',
};

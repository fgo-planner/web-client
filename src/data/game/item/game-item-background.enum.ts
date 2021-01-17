/**
 * Enumeration of inventory item background display types.
 */
export enum GameItemBackground {
    None = 'None',
    Bronze = 'Bronze',
    Silver = 'Silver',
    Gold = 'Gold',
    QPReward = 'QPReward'
}

export const GameItemBackgroundDisplayMap: { readonly [key in GameItemBackground]: string } = {
    [GameItemBackground.None]: GameItemBackground.None,
    [GameItemBackground.Bronze]: GameItemBackground.Bronze,
    [GameItemBackground.Silver]: GameItemBackground.Silver,
    [GameItemBackground.Gold]: GameItemBackground.Gold,
    [GameItemBackground.QPReward]: 'QP Reward'
};

/**
 * Enumeration of inventory item types.
 */
export enum GameItemType {
    Master = 'Master',
    Enhancement = 'Enhancement',
    EventItem = 'EventItem'
}

export const GameItemTypeDisplayMap: { readonly [key in GameItemType]: string } = {
    [GameItemType.Master]: GameItemType.Master,
    [GameItemType.Enhancement]: GameItemType.Enhancement,
    [GameItemType.EventItem]: 'Event Item'
};

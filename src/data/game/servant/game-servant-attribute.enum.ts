/**
 * Enumerations of servant attributes.
 */
export enum GameServantAttribute {
    Man = 'Man',
    Sky = 'Sky',
    Earth = 'Earth',
    Star = 'Star',
    Beast = 'Beast'
}

export const GameServantAttributeDisplayMap: { readonly [key in GameServantAttribute]: string } = {
    [GameServantAttribute.Man]: GameServantAttribute.Man,
    [GameServantAttribute.Sky]: GameServantAttribute.Sky,
    [GameServantAttribute.Earth]: GameServantAttribute.Earth,
    [GameServantAttribute.Star]: GameServantAttribute.Star,
    [GameServantAttribute.Beast]: GameServantAttribute.Beast,
};

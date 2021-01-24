/**
 * Enumerations of servant classes.
 */
export enum GameServantClass {
    Saber = 'Saber',
    Archer = 'Archer',
    Lancer = 'Lancer',
    Rider = 'Rider',
    Caster = 'Caster',
    Assassin = 'Assassin',
    Berserker = 'Berserker',
    Shielder = 'Shielder',
    Ruler = 'Ruler',
    AlterEgo = 'AlterEgo',
    Avenger = 'Avenger',
    MoonCancer = 'MoonCancer',
    Foreigner = 'Foreigner',
    BeastI = 'BeastI',
    BeastII = 'BeastII',
    BeastIIIR = 'BeastIIIR',
    BeastIIIL = 'BeastIIIL',
    BeastFalse = 'BeastFalse',
    Unknown = 'Unknown'
}

export const GameServantClassDisplayMap: { readonly [key in GameServantClass]: string } = {
    [GameServantClass.Saber]: GameServantClass.Saber,
    [GameServantClass.Archer]: GameServantClass.Archer,
    [GameServantClass.Lancer]: GameServantClass.Lancer,
    [GameServantClass.Rider]: GameServantClass.Rider,
    [GameServantClass.Caster]: GameServantClass.Caster,
    [GameServantClass.Assassin]: GameServantClass.Assassin,
    [GameServantClass.Berserker]: GameServantClass.Berserker,
    [GameServantClass.Shielder]: GameServantClass.Shielder,
    [GameServantClass.Ruler]: GameServantClass.Ruler,
    [GameServantClass.AlterEgo]: 'Alter Ego',
    [GameServantClass.Avenger]: GameServantClass.Avenger,
    [GameServantClass.MoonCancer]: 'Moon Cancer',
    [GameServantClass.Foreigner]: GameServantClass.Foreigner,
    [GameServantClass.BeastI]: 'Beast I',
    [GameServantClass.BeastII]: 'Beast II',
    [GameServantClass.BeastIIIR]: 'Beast III/R',
    [GameServantClass.BeastIIIL]: 'Beast III/L',
    [GameServantClass.BeastFalse]: 'Beast (False)',
    [GameServantClass.Unknown]: GameServantClass.Unknown
};

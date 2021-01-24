/**
 * Enumerations of servant genders.
 */
export enum GameServantGender {
    Male = 'Male',
    Female = 'Female',
    None = 'None'
}

export const GameServantGenderDisplayMap: { readonly [key in GameServantGender]: string } = {
    [GameServantGender.Male]: GameServantGender.Male,
    [GameServantGender.Female]: GameServantGender.Female,
    [GameServantGender.None]: 'Unknown/None'
};

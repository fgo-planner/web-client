export class GameServantConstants {

    static readonly ThumbnailBaseUrl = 'https://assets.atlasacademy.io/GameData/JP/Faces';

    static readonly ThumbnailExtension = 'png';

    static readonly ClassIconBaseUrl = 'https://assets.atlasacademy.io/GameData/JP/ClassIcons';

    static readonly ClassIconExtension = 'png';

    static readonly BondIconBaseUrl = `${process.env.PUBLIC_URL}/assets/bond`;

    static readonly BondIconExtension = 'png';

    static readonly MinLevel = 1;

    static readonly MaxLevel = 100;

    static readonly MinFou = 0;

    static readonly MaxFou = 2000;

    static readonly MinAscensionLevel = 0;

    static readonly MaxAscensionLevel = 4;

    static readonly AscensionLevels: ReadonlyArray<number> = Array.from(Array(5).keys());

    static readonly MinSkillLevel = 1;

    static readonly MaxSkillLevel = 10;

    static readonly SkillLevels: ReadonlyArray<number> = Array.from(Array(10).keys()).map(i => i + 1);

    static readonly MinNoblePhantasmLevel = 1;

    static readonly MaxNoblePhantasmLevel = 5;

    static readonly NoblePhantasmLevels: ReadonlyArray<number> = Array.from(Array(5).keys()).map(i => i + 1);

    static readonly MinBondLevel = 0;

    static readonly MaxBondLevel = 15;

    static readonly BondLevels: ReadonlyArray<number> = Array.from(Array(16).keys());

}
import { GameServantClass, GameServantRarity, MasterServantAscensionLevel, MasterServantBondLevel, MasterServantNoblePhantasmLevel, MasterServantSkillLevel } from '@fgo-planner/data-types';
import { ReadonlyRecord } from '../types/internal';

export class GameServantConstants {

    static readonly ClassDisplayNameMap: ReadonlyRecord<GameServantClass, string> = {
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
        [GameServantClass.Pretender]: GameServantClass.Pretender,
        [GameServantClass.Unknown]: GameServantClass.Unknown
    };

    static readonly MinLevel = 1;

    static readonly MaxLevel = 120;

    static readonly MinFou = 0;

    static readonly MaxFou = 2000;

    static readonly MinAscensionLevel = 0;

    static readonly MaxAscensionLevel = 4;

    static readonly AscensionLevels = Array.from(Array(5).keys()) as ReadonlyArray<MasterServantAscensionLevel>;

    static readonly MinSkillLevel = 1;

    static readonly MaxSkillLevel = 10;

    static readonly SkillLevels = Array.from(Array(10).keys()).map(i => i + 1)  as ReadonlyArray<MasterServantSkillLevel>;

    static readonly MinNoblePhantasmLevel = 1;

    static readonly MaxNoblePhantasmLevel = 5;

    static readonly NoblePhantasmLevels = Array.from(Array(5).keys()).map(i => i + 1) as ReadonlyArray<MasterServantNoblePhantasmLevel>;

    static readonly MinBondLevel = 0;

    static readonly MaxBondLevel = 15;

    static readonly BondLevels = Array.from(Array(16).keys()) as ReadonlyArray<MasterServantBondLevel>;

    static readonly MinRarity = 0;

    static readonly MaxRarity = 5;

    static readonly RarityValues = Array.from(Array(6).keys()) as ReadonlyArray<GameServantRarity>;

    /**
     * OG Artoria. For use when instantiating new servant data.
     */
    static readonly DefaultServantId = 100100;

    private constructor () {
        
    }

}
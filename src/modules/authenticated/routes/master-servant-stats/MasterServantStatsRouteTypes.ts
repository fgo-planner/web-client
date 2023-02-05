import { GameServantRarity, InstantiatedServantAscensionLevel, InstantiatedServantBondLevel, InstantiatedServantNoblePhantasmLevel, InstantiatedServantSkillLevel } from '@fgo-planner/data-core';
import { GameServantClassSimplified } from '../../../../types';

export namespace MasterServantStatsRouteTypes {

    export type GroupBy = 'rarity' | 'class';

    export type StatGroupedByRarity = {
        [key in GameServantRarity]: number;
    } & {
        overall: number;
    };

    export type StatGroupedByClass = {
        [key in GameServantClassSimplified]: number;
    } & {
        overall: number;
    };

    export type Stats<T = Record<string, number>> = {
        totalCount: T;
        uniqueCount: T;
        npLevels: Record<InstantiatedServantNoblePhantasmLevel | 'total', T>;
        averageNpLevel: T;
        ascensionLevels: Record<InstantiatedServantAscensionLevel, T>;
        averageAscensionLevel: T;
        skillLevels: Record<InstantiatedServantSkillLevel | 0, T>;
        tripleNineSkillsCount: T;
        tripleTenSkillsCount: T;
        averageSkillLevel: T;
        appendSkillLevels: Record<InstantiatedServantSkillLevel | 0, T>;
        tripleNineAppendSkillsCount: T;
        tripleTenAppendSkillsCount: T;
        averageAppendSkillLevel: T;
        maxHpFouCount: T;
        maxAtkFouCount: T;
        maxGoldHpFouCount: T;
        maxGoldAtkFouCount: T;
        doubleMaxFouCount: T;
        doubleMaxGoldFouCount: T;
        fouValuesCount: T; // For computing the average; undefined values are excluded
        averageFou: T;
        bondLevels: Record<InstantiatedServantBondLevel, T>;
        bondLevelValuesCount: T; // For computing the average; undefined values are excluded
        averageBondLevel: T;
    };

    export type StatsGroupedByRarity = Stats<StatGroupedByRarity>;

    export type StatsGroupedByClass = Stats<StatGroupedByClass>;

    export type FilterOptions = {
        classes: Set<GameServantClassSimplified>;
        rarities: Set<GameServantRarity>;
    };

}

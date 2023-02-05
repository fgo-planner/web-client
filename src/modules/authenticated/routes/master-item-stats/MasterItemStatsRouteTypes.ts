export namespace MasterItemStatsRouteTypes {

    export type FilterOptions = Readonly<{
        includeAppendSkills: boolean;
        includeCostumes: boolean;
        includeLores: boolean;
        includeSoundtracks: boolean;
        includeUnsummonedServants: boolean;
    }>;

    export type ItemStat = {
        inventory: number;
        used: number;
        cost: number;
        debt: number;
    };

    export type ItemStats = Record<number, ItemStat>;
    
}

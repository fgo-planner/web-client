import { Immutable, ImmutableArray } from '@fgo-planner/common-core';
import { GameServant, ImmutableMasterServant, MasterServantAggregatedData, PlanServant, PlanServantAggregatedData } from '@fgo-planner/data-core';
import { GameServantMap } from '../types';

function getGameServant(data: MasterServantAggregatedData): Immutable<GameServant> {
    return data.gameServant;
};

function getMasterServant(data: MasterServantAggregatedData): ImmutableMasterServant {
    return data.masterServant;
};

function aggregateDataForMasterServants(
    masterServants: ReadonlyArray<ImmutableMasterServant>,
    gameServantMap: GameServantMap
): Array<MasterServantAggregatedData> {
    const result: Array<MasterServantAggregatedData> = [];
    for (const masterServant of masterServants) {
        const aggregatedData = aggregateDataForMasterServant(masterServant, gameServantMap);
        if (aggregatedData) {
            result.push(aggregatedData);
        }
    }
    return result;
}

function aggregateDataForMasterServant(
    masterServant: ImmutableMasterServant,
    gameServantMap: GameServantMap
): MasterServantAggregatedData | null {
    const gameId = masterServant.gameId;
    const gameServant = gameServantMap[gameId];
    if (!gameServant) {
        console.warn(`Servant gameId=${gameId} could not be found.`);
        return null;
    }
    return {
        instanceId: masterServant.instanceId,
        masterServant,
        gameServant
    };
}

function aggregateDataForPlanServants(
    planServants: ImmutableArray<PlanServant>,
    masterServantDataMap: ReadonlyMap<number, MasterServantAggregatedData>
): Array<PlanServantAggregatedData> {
    const result: Array<PlanServantAggregatedData> = [];
    for (const planServant of planServants) {
        const aggregatedData = aggregateDataForPlanServant(planServant, masterServantDataMap);
        if (aggregatedData) {
            result.push(aggregatedData);
        }
    }
    return result;
}

function aggregateDataForPlanServant(
    planServant: Immutable<PlanServant>,
    masterServantDataMap: ReadonlyMap<number, MasterServantAggregatedData>
): PlanServantAggregatedData | null {
    const instanceId = planServant.instanceId;
    const masterServantData = masterServantDataMap.get(instanceId);
    if (!masterServantData) {
        console.warn(`Master servant data for instanceId=${instanceId} could not be found.`);
        return null;
    }
    return {
        ...masterServantData,
        planServant
    };
}

export const DataAggregationUtils = {
    getGameServant,
    getMasterServant,
    aggregateDataForMasterServant,
    aggregateDataForMasterServants,
    aggregateDataForPlanServant,
    aggregateDataForPlanServants
} as const;

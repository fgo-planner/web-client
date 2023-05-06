import { Immutable, ImmutableArray } from '@fgo-planner/common-core';
import { GameServant, ImmutableMasterServant, MasterServantAggregatedData, PlanServant, PlanServantAggregatedData } from '@fgo-planner/data-core';
import { GameServantMap } from './game/GameServantMap';

export namespace DataAggregationUtils {

    export function getGameServant(data: MasterServantAggregatedData): Immutable<GameServant> {
        return data.gameServant;
    };

    export function getMasterServant(data: MasterServantAggregatedData): ImmutableMasterServant {
        return data.masterServant;
    };

    export function aggregateDataForMasterServants(
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

    export function aggregateDataForMasterServant(
        masterServant: ImmutableMasterServant,
        gameServantMap: GameServantMap
    ): MasterServantAggregatedData | null {
        const servantId = masterServant.servantId;
        const gameServant = gameServantMap.get(servantId);
        if (!gameServant) {
            return null;
        }
        return {
            instanceId: masterServant.instanceId,
            masterServant,
            gameServant
        };
    }

    export function aggregateDataForPlanServants(
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

    export function aggregateDataForPlanServant(
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

}

import { SetUtils } from '@fgo-planner/common-core';
import { ImmutableMasterServant, MasterServantUtils } from '@fgo-planner/data-core';
import { useCallback, useEffect, useState } from 'react';
import { useForceUpdate } from '../../../../../hooks/utils/use-force-update.hook';

type SelectedServantsData = {
    instanceIds: ReadonlySet<number>;
    servants: ReadonlyArray<ImmutableMasterServant>  // TODO Add option for ordering
};

class SelectedServantsDataContainer implements SelectedServantsData {

    selectedServants?: ReadonlyArray<ImmutableMasterServant>;

    selectedInstanceIds: ReadonlySet<number> = SetUtils.emptySet();

    get instanceIds(): ReadonlySet<number> {
        return this.selectedInstanceIds;
    }

    /**
     * Lazy fetches the selected `MasterServant` objects. The servants are returned
     * in the order as the appear in the `sourceData` array.
     * 
     * TODO Add option to order by the `selectedInstanceIds` set.
     */
    get servants(): ReadonlyArray<ImmutableMasterServant> {
        if (!this.selectedServants) {
            const selectedInstanceIds = this.selectedInstanceIds;
            this.selectedServants = this.sourceData.filter(({ instanceId }) => {
                return selectedInstanceIds.has(instanceId);
            });
        }
        return this.selectedServants!;
    }

    constructor(public sourceData: ReadonlyArray<ImmutableMasterServant>) {

    }

}

type MasterServantsSelectedServantsHootResult = {
    /**
     * Guaranteed to be stable between rerenders.
     */
    selectedServantsData: Readonly<SelectedServantsData>;
    selectAllServants: () => void;
    deselectAllServants: () => void;
    updateSelectedServants: (selectedInstanceIds: ReadonlySet<number>) => void;
};

/**
 * Utility hook that manages servant selection on the master servants route.
 *
 * TODO Move this under the `hooks` directory of the authenticated module if
 * other routes need to use it.
 */
export const useMasterServantsSelectedServants = (
    sourceData: ReadonlyArray<ImmutableMasterServant>
): MasterServantsSelectedServantsHootResult => {

    const forceUpdate = useForceUpdate();

    const [selectedServantsData] = useState<SelectedServantsDataContainer>(() => new SelectedServantsDataContainer(sourceData));
    
    useEffect(() => {
        selectedServantsData.sourceData = sourceData;
        selectedServantsData.selectedServants = undefined;
    }, [selectedServantsData, sourceData]);

    const updateSelectedServants = useCallback((selectedInstanceIds: ReadonlySet<number>): void => {
        if (SetUtils.isEqual(selectedInstanceIds, selectedServantsData.selectedInstanceIds)) {
            return;
        }
        selectedServantsData.selectedInstanceIds = selectedInstanceIds;
        selectedServantsData.selectedServants = undefined;
        forceUpdate();
    }, [forceUpdate, selectedServantsData]);

    const selectAllServants = useCallback((): void => {
        const allInstanceIds = selectedServantsData.sourceData.map(MasterServantUtils.getInstanceId);
        updateSelectedServants(new Set(allInstanceIds));
    }, [selectedServantsData, updateSelectedServants]);

    const deselectAllServants = useCallback((): void => {
        updateSelectedServants(SetUtils.emptySet());
    }, [updateSelectedServants]);

    return {
        selectedServantsData,
        selectAllServants,
        deselectAllServants,
        updateSelectedServants
    };

};

import { ImmutableArray, SetUtils } from '@fgo-planner/common-core';
import { GameServant, MasterServantUpdate, MasterServantUpdateBoolean } from '@fgo-planner/data-core';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { useCallback, useEffect, useState } from 'react';
import { ServantCostumeSelectList } from '../../../../../../components/input/servant/costume/servant-costume-select-list.component';

type Props = {
    gameServants: ImmutableArray<GameServant>;
    /**
     * The update payload for editing. This will be modified directly, so provide a
     * clone if modification to the original object is not desired.
     */
    masterServantUpdate: MasterServantUpdate;
};

const transformUnlockedCostumes = (unlockedCostumes: Map<number, MasterServantUpdateBoolean>): Set<number> => {
    const result = new Set<number>();
    for (const [key, value] of unlockedCostumes.entries()) {
        if (!value) {
            continue;
        }
        result.add(key);
    }
    return result;
};

const StyleClassPrefix = 'MasterServantEditDialogCostumesTabContent';

const StyleProps = (theme: SystemTheme) => ({
    overflowY: 'auto',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    [theme.breakpoints.up('sm')]: {
        position: 'absolute'
    }
} as SystemStyleObject<SystemTheme>);

export const MasterServantEditDialogCostumesTabContent = React.memo((props: Props) => {

    const {
        gameServants,
        masterServantUpdate: {
            unlockedCostumes
        }
    } = props;

    const [selectedCostumeIds, setSelectedCostumeIds] = useState<ReadonlySet<number>>(() => transformUnlockedCostumes(unlockedCostumes));

    useEffect((): void => {
        setSelectedCostumeIds(transformUnlockedCostumes(unlockedCostumes));
    }, [unlockedCostumes]);

    const handleSelectionChange = useCallback((selectedCostumeIds: ReadonlySet<number>): void => {
        setSelectedCostumeIds(prevSelectedCostumeIds => {
            if (SetUtils.isEqual(prevSelectedCostumeIds, selectedCostumeIds)) {
                return prevSelectedCostumeIds;
            }
            for (const costumeId of selectedCostumeIds) {
                unlockedCostumes.set(costumeId, MasterServantUpdateBoolean.True);
            }
            for (const costumeId of unlockedCostumes.keys()) {
                if (!selectedCostumeIds.has(costumeId)) {
                    unlockedCostumes.set(costumeId, MasterServantUpdateBoolean.False);
                }
            }
            return selectedCostumeIds;
        });
    }, [unlockedCostumes]);

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <ServantCostumeSelectList
                gameServants={gameServants}
                selectedCostumeIds={selectedCostumeIds}
                onSelectionChange={handleSelectionChange}
            />
        </Box>
    );

});

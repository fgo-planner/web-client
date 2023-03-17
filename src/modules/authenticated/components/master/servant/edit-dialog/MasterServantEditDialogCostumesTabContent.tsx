import { GameServantCostumeAggregatedData, InstantiatedServantUpdateUtils, MasterServantUpdate } from '@fgo-planner/data-core';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { ServantCostumeSelectList } from '../../../../../../components/input/servant/select-list/ServantCostumeSelectList';
import { ThemeConstants } from '../../../../../../styles/ThemeConstants';

type Props = {
    costumesData: ReadonlyArray<GameServantCostumeAggregatedData>;
    /**
     * The update payload for editing. This will be modified directly, so provide a
     * clone if modification to the original object is not desired.
     */
    masterServantUpdate: MasterServantUpdate;
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
        costumesData,
        masterServantUpdate: {
            unlockedCostumes
        }
    } = props;

    const [selectedCostumeIds, setSelectedCostumeIds] = useState<ReadonlySet<number>>();

    useEffect((): void => {
        const selectedCostumeIds = InstantiatedServantUpdateUtils.convertFromCostumesMap(unlockedCostumes);
        setSelectedCostumeIds(selectedCostumeIds);
    }, [unlockedCostumes]);

    const handleSelectionChange = useCallback((selectedCostumeIds: ReadonlySet<number>): void => {
        for (const costumeId of selectedCostumeIds) {
            unlockedCostumes.set(costumeId, true);
        }
        for (const costumeId of unlockedCostumes.keys()) {
            if (!selectedCostumeIds.has(costumeId)) {
                unlockedCostumes.set(costumeId, false);
            }
        }
        setSelectedCostumeIds(selectedCostumeIds);
    }, [unlockedCostumes]);

    const classNames = clsx(
        `${StyleClassPrefix}-root`,
        ThemeConstants.ClassScrollbarTrackBorder
    );

    /**
     * This will be undefined on initial render. We return to avoid having the
     * ServantCostumeSelectList component unintentionally deselecting all costumes.
     */
    if (!selectedCostumeIds) {
        return null;
    }

    return (
        <Box className={classNames} sx={StyleProps}>
            <ServantCostumeSelectList
                costumesData={costumesData}
                selectedCostumeIds={selectedCostumeIds}
                onSelectionChange={handleSelectionChange}
            />
        </Box>
    );

});

import { GameServantCostumeAggregatedData, InstantiatedServantUpdateUtils, PlanServantUpdate } from '@fgo-planner/data-core';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { ServantCostumeSelectList } from '../../../../../components/input/servant/select-list/ServantCostumeSelectList';
import { ThemeConstants } from '../../../../../styles/ThemeConstants';

type Props = {
    costumesData: ReadonlyArray<GameServantCostumeAggregatedData>;
    /**
     * The servant update data. This object will be modified directly.
     */
    planServantUpdate: PlanServantUpdate;
    /**
     * Set of costumes IDs that are already unlocked.
     */
    unlockedCostumes: ReadonlySet<number>;
};

const StyleClassPrefix = 'PlanRoutePlanServantEditDialogCostumesTabContent';

const StyleProps = (theme: SystemTheme) => ({
    overflowY: 'auto',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    [theme.breakpoints.up('sm')]: {
        position: 'absolute'
    }
} as SystemStyleObject<SystemTheme>);

export const PlanRoutePlanServantEditDialogCostumesTabContent = React.memo((props: Props) => {

    const {
        costumesData,
        planServantUpdate: {
            costumes
        },
        unlockedCostumes
    } = props;

    const [selectedCostumeIds, setSelectedCostumeIds] = useState<ReadonlySet<number>>();

    useEffect((): void => {
        const selectedCostumeIds = InstantiatedServantUpdateUtils.convertFromCostumesMap(costumes);
        setSelectedCostumeIds(selectedCostumeIds);
    }, [costumes, costumesData, unlockedCostumes]);

    const handleSelectionChange = useCallback((selectedCostumeIds: ReadonlySet<number>): void => {
        for (const costumeId of selectedCostumeIds) {
            costumes.set(costumeId, true);
        }
        for (const costumeId of costumes.keys()) {
            if (!selectedCostumeIds.has(costumeId)) {
                costumes.set(costumeId, false);
            }
        }
        setSelectedCostumeIds(selectedCostumeIds);
    }, [costumes]);

    const classNames = clsx(
        `${StyleClassPrefix}-root`,
        ThemeConstants.ClassScrollbarTrackBorder
    );

    /**
     * This can be undefined during initial render.
     */
    if (!selectedCostumeIds) {
        return null;
    }

    return (
        <Box className={classNames} sx={StyleProps}>
            <ServantCostumeSelectList
                costumesData={costumesData}
                disabledCostumeIds={unlockedCostumes}
                selectedCostumeIds={selectedCostumeIds}
                showDisabledAsSelected
                onSelectionChange={handleSelectionChange}
            />
        </Box>
    );

});

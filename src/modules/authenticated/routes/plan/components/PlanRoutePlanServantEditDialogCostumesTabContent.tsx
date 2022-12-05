import { CollectionUtils } from '@fgo-planner/common-core';
import { InstantiatedServantUpdateUtils, PlanServantUpdate } from '@fgo-planner/data-core';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { ServantCostumeSelectList } from '../../../../../components/input/servant/costume/ServantCostumeSelectList';
import { ThemeConstants } from '../../../../../styles/theme-constants';
import { GameServantCostumeAggregatedData } from '../../../../../types';

type Props = {
    costumesData: ReadonlyArray<GameServantCostumeAggregatedData>;
    /**
     * The servant update data. This object will be modified directly.
     */
    planServantUpdate: PlanServantUpdate;
};

const StyleClassPrefix = 'PlanServantEditCostumesTabContent';

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
        }
    } = props;

    const [selectedCostumeIds, setSelectedCostumeIds] = useState<ReadonlySet<number>>(CollectionUtils.emptySet);

    useEffect((): void => {
        const selectedCostumeIds = InstantiatedServantUpdateUtils.convertFromCostumesMap(costumes);
        setSelectedCostumeIds(selectedCostumeIds);
    }, [costumes]);

    const handleSelectionChange = useCallback((selectedCostumeIds: ReadonlySet<number>): void => {
        // TODO Is this equality check even needed?
        setSelectedCostumeIds(prevSelectedCostumeIds => {
            if (CollectionUtils.isSetsEqual(prevSelectedCostumeIds, selectedCostumeIds)) {
                return prevSelectedCostumeIds;
            }
            for (const costumeId of selectedCostumeIds) {
                costumes.set(costumeId, true);
            }
            for (const costumeId of costumes.keys()) {
                if (!selectedCostumeIds.has(costumeId)) {
                    costumes.set(costumeId, false);
                }
            }
            return selectedCostumeIds;
        });
    }, [costumes]);

    const classNames = clsx(
        `${StyleClassPrefix}-root`,
        ThemeConstants.ClassScrollbarTrackBorder
    );

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

import { CollectionUtils, Immutable, ImmutableArray } from '@fgo-planner/common-core';
import { GameServant, MasterServantUpdate } from '@fgo-planner/data-core';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { ServantCostumeSelectList } from '../../../../../../components/input/servant/costume/servant-costume-select-list.component';
import { ThemeConstants } from '../../../../../../styles/theme-constants';

type Props = {
    gameServants?: Immutable<GameServant> | ImmutableArray<GameServant>;
    /**
     * The update payload for editing. This will be modified directly, so provide a
     * clone if modification to the original object is not desired.
     */
    masterServantUpdate: MasterServantUpdate;
};

/**
 * TODO Move this to utils?
 */
const transformCostumes = (unlockedCostumes: Map<number, boolean>): Set<number> => {
    const result = new Set<number>();
    for (const [key, value] of unlockedCostumes.entries()) {
        if (value) {
            result.add(key);
        }
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

    const [selectedCostumeIds, setSelectedCostumeIds] = useState<ReadonlySet<number>>(() => transformCostumes(unlockedCostumes));

    useEffect((): void => {
        setSelectedCostumeIds(transformCostumes(unlockedCostumes));
    }, [unlockedCostumes]);

    const handleSelectionChange = useCallback((selectedCostumeIds: ReadonlySet<number>): void => {
        setSelectedCostumeIds(prevSelectedCostumeIds => {
            if (CollectionUtils.isSetsEqual(prevSelectedCostumeIds, selectedCostumeIds)) {
                return prevSelectedCostumeIds;
            }
            for (const costumeId of selectedCostumeIds) {
                unlockedCostumes.set(costumeId, true);
            }
            for (const costumeId of unlockedCostumes.keys()) {
                if (!selectedCostumeIds.has(costumeId)) {
                    unlockedCostumes.set(costumeId, false);
                }
            }
            return selectedCostumeIds;
        });
    }, [unlockedCostumes]);

    const classNames = clsx(
        `${StyleClassPrefix}-root`,
        ThemeConstants.ClassScrollbarTrackBorder
    );

    return (
        <Box className={classNames} sx={StyleProps}>
            <ServantCostumeSelectList
                gameServants={gameServants}
                selectedCostumeIds={selectedCostumeIds}
                onSelectionChange={handleSelectionChange}
            />
        </Box>
    );

});

import { ReadonlyRecord } from '@fgo-planner/common-core';
import { GameServantCostumeAggregatedData } from '@fgo-planner/data-core';
import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ReactNode } from 'react';
import { useGameServantCostumesData } from '../../../../../hooks/data/useGameServantCostumesData';
import { useGameServantList } from '../../../../../hooks/data/useGameServantList';
import { MasterServantCostumesRouteCostumeListHeader } from './MasterServantCostumesRouteCostumeListHeader';
import { MasterServantCostumesRouteCostumeListRow, StyleClassPrefix as MasterServantCostumesRouteCostumeListRowStyleClassPrefix } from './MasterServantCostumesRouteCostumeListRow';

type Props = {
    onChange(costumeId: number, unlocked?: boolean, noCostUnlock?: boolean): void;
    unlockedCostumes: ReadonlyRecord<number, boolean>;
};

const StyleClassPrefix = 'MasterServantCostumesRouteCostumeList';

const StyleProps = (theme: SystemTheme) => {

    const {
        breakpoints,
        palette,
        spacing
    } = theme as Theme;

    return {
        backgroundColor: palette.background.paper,
        height: '100%',
        overflow: 'auto',
        [`& .${StyleClassPrefix}-list-container`]: {
            display: 'flex',
            flexDirection: 'column',
            [`& .${MasterServantCostumesRouteCostumeListRowStyleClassPrefix}-root`]: {
                height: 52,
                display: 'flex',
                alignItems: 'center',
                [`& .${MasterServantCostumesRouteCostumeListRowStyleClassPrefix}-text`]: {
                    fontSize: '0.875rem'
                },
                [`& .${MasterServantCostumesRouteCostumeListRowStyleClassPrefix}-unlocked-status`]: {
                    minWidth: 42,
                    px: 2,
                    textAlign: 'center',
                },
                [`& .${MasterServantCostumesRouteCostumeListRowStyleClassPrefix}-collection-no`]: {
                    width: 64,
                    textAlign: 'center'
                },
                [`& .${MasterServantCostumesRouteCostumeListRowStyleClassPrefix}-name`]: {
                    flex: '1 1',
                    minWidth: 0,
                    [breakpoints.down('sm')]: {
                        visibility: 'hidden',
                        maxWidth: spacing(8),  // 32px
                    }
                },
                [`& .${MasterServantCostumesRouteCostumeListRowStyleClassPrefix}-no-cost-status`]: {
                    minWidth: 42,
                    px: 2,
                    textAlign: 'center',
                },
                [`& .${MasterServantCostumesRouteCostumeListRowStyleClassPrefix}-unlock-materials`]: {
                    display: 'flex',
                    justifyContent: 'flex-end',
                    minWidth: 300,
                    pr: 8,
                    '>div': {
                        fontSize: '0.875rem'
                    },
                    [breakpoints.down('sm')]: {
                        pr: 6
                    }
                }
            },
            [breakpoints.down('sm')]: {
                minWidth: 'fit-content'
            }
        }
    } as SystemStyleObject<SystemTheme>;
};

export const MasterServantCostumesRouteCostumeList = React.memo(({ onChange, unlockedCostumes }: Props) => {

    const gameServantList = useGameServantList();

    const costumesData = useGameServantCostumesData(gameServantList);

    /**
     * This can be empty during the initial render.
     */
    if (!costumesData.length) {
        return null;
    }

    const renderCostumeRow = (costumeData: GameServantCostumeAggregatedData): ReactNode => {
        const { costumeId } = costumeData;
        const noCostUnlock = unlockedCostumes[costumeId];
        const unlocked = noCostUnlock !== undefined;
        return (
            <MasterServantCostumesRouteCostumeListRow
                key={costumeId}
                costumeData={costumeData}
                noCostUnlock={noCostUnlock}
                openLinksInNewTab
                unlocked={unlocked}
                onChange={onChange}
            />
        );
    };

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-list-container`}>
                <MasterServantCostumesRouteCostumeListHeader />
                {costumesData.map(renderCostumeRow)}
            </div>
        </Box>
    );

});

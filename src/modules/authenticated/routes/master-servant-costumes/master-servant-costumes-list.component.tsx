import { Theme } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import React, { ReactNode, useMemo } from 'react';
import { useGameServantList } from '../../../../hooks/data/use-game-servant-list.hook';
import { GameServantList } from '../../../../types/data';
import { MasterServantCostumesListHeader } from './master-servant-costumes-list-header.component';
import { MasterServantCostumeRowData, MasterServantCostumesListRow, StyleClassPrefix as MasterServantCostumesListRowStyleClassPrefix } from './master-servant-costumes-list-row.component';

type Props = {
    onChange: (costumeId: number, unlocked: boolean) => void;
    unlockedCostumes: ReadonlySet<number>;
};

const transformCostumesList = (gameServants: GameServantList): Array<MasterServantCostumeRowData> => {
    const result: MasterServantCostumeRowData[] = [];
    for (const servant of gameServants) {
        const { costumes } = servant;
        for (const [id, costume] of Object.entries(costumes)) {
            result.push({
                costumeId: Number(id),
                servant,
                ...costume
            });
        }
    }
    result.sort((a, b) => a.collectionNo - b.collectionNo);
    return result;
};

const StyleClassPrefix = 'MasterServantCostumesList';

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
            [`& .${MasterServantCostumesListRowStyleClassPrefix}-root`]: {
                height: 52,
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.875rem',
                [`& .${MasterServantCostumesListRowStyleClassPrefix}-unlocked-status`]: {
                    minWidth: 42,
                    px: 2,
                    textAlign: 'center',
                },
                [`& .${MasterServantCostumesListRowStyleClassPrefix}-collection-no`]: {
                    width: 64,
                    textAlign: 'center'
                },
                [`& .${MasterServantCostumesListRowStyleClassPrefix}-name`]: {
                    flex: '1 1',
                    minWidth: 0,
                    [breakpoints.down('sm')]: {
                        visibility: 'hidden',
                        maxWidth: spacing(8),  // 32px
                    }
                },
                [`& .${MasterServantCostumesListRowStyleClassPrefix}-unlock-materials`]: {
                    display: 'flex',
                    justifyContent: 'flex-end',
                    minWidth: spacing(75),  // 300px
                    pr: 8,
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

export const MasterServantCostumesList = React.memo(({ onChange, unlockedCostumes }: Props) => {

    const gameServantList = useGameServantList();

    const costumesList = useMemo(() => {
        if (!gameServantList) {
            return [];
        }
        return transformCostumesList(gameServantList);
    }, [gameServantList]);

    /*
     * This can be empty during the initial render.
     */
    if (!costumesList.length) {
        return null;
    }

    const renderCostumeRow = (costume: MasterServantCostumeRowData): ReactNode => {
        const { costumeId } = costume;
        const unlocked = unlockedCostumes.has(costumeId);
        return (
            <MasterServantCostumesListRow
                key={costumeId}
                costume={costume}
                unlocked={unlocked}
                onChange={onChange}
                openLinksInNewTab
            />
        );
    };

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-list-container`}>
                <MasterServantCostumesListHeader />
                {costumesList.map(renderCostumeRow)}
            </div>
        </Box>
    );

});

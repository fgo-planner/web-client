import { Nullable } from '@fgo-planner/common-core';
import { MasterAccount } from '@fgo-planner/data-core';
import { Icon, IconButton, Theme, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { Link } from 'react-router-dom';
import { NavigationRail } from '../../../../components/navigation/navigation-rail/NavigationRail';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useGameItemMap } from '../../../../hooks/data/use-game-item-map.hook';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { useGameSoundtrackList } from '../../../../hooks/data/use-game-soundtrack-list.hook';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/use-active-breakpoints.hook';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { StorageKeys } from '../../../../utils/storage/storage-keys';
import { StorageUtils } from '../../../../utils/storage/storage.utils';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { MasterItemStatsFilterControls } from './master-item-stats-filter-controls.component';
import { MasterItemStatsTable } from './master-item-stats-table.component';
import { MasterItemStats, MasterItemStatsFilterOptions, MasterItemStatsUtils } from './master-item-stats.utils';

/**
 * User preferences for the master item stats route that are stored locally.
 */
type MasterItemStatsLocalUserPreferences = {
    filter: MasterItemStatsFilterOptions;
};

type FilterReducerAction = {
    property: keyof MasterItemStatsFilterOptions;
    value: boolean;
};

const DefaultFilterOptions: MasterItemStatsFilterOptions = {
    includeUnsummonedServants: false,
    includeAppendSkills: false,
    includeLores: true,
    includeCostumes: false,
    includeSoundtracks: false
};

const getDefaultLocalUserPreferences = (): MasterItemStatsLocalUserPreferences => ({
    filter: DefaultFilterOptions
});

const filterReducer = (
    currentState: MasterItemStatsFilterOptions,
    action: FilterReducerAction
): MasterItemStatsFilterOptions => {
    if (currentState[action.property] === action.value) {
        return currentState;
    }
    const updatedState = {
        ...currentState,
        [action.property]: action.value
    };
    /**
     * So far the only thing being stored for this route is the filter options, so
     * this is fine.
     */
    StorageUtils.setItem(StorageKeys.LocalUserPreference.Route.MasterItemStats, { filter: updatedState });
    return updatedState;
};

const StyleClassPrefix = 'MasterItemStats';

const StyleProps = (theme: SystemTheme) => {

    const {
        breakpoints,
        palette,
        spacing
    } = theme as Theme;

    return {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        [`& .${StyleClassPrefix}-upper-layout-container`]: {
            '&>div': {
                display: 'flex',
                alignItems: 'center',
                minHeight: '4rem',
                px: 6,
                py: 0,
                borderBottomWidth: 1,
                borderBottomStyle: 'solid',
                borderBottomColor: palette.divider
            }
        },
        [`& .${StyleClassPrefix}-lower-layout-container`]: {
            display: 'flex',
            height: '100%',
            overflow: 'hidden',
            [`& .${StyleClassPrefix}-main-content`]: {
                display: 'flex',
                width: `calc(100% - ${spacing(ThemeConstants.NavigationRailSizeScale)})`,
                [`& .${StyleClassPrefix}-table-container`]: {
                    flex: 1,
                    overflow: 'hidden'
                },
                [`& .${StyleClassPrefix}-info-panel-container`]: {
                    height: '100%',
                    boxSizing: 'border-box',
                    [breakpoints.down('md')]: {
                        display: 'none'
                    }
                },
            },
            [breakpoints.down('sm')]: {
                flexDirection: 'column',
                [`& .${StyleClassPrefix}-main-content`]: {
                    width: '100%',
                    height: `calc(100% - ${spacing(ThemeConstants.NavigationRailSizeScale)})`
                }
            }
        }
    } as SystemStyleObject<SystemTheme>;
};


export const MasterItemStatsRoute = React.memo(() => {

    const { sm } = useActiveBreakpoints();

    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();

    const gameServantMap = useGameServantMap();
    const gameItemMap = useGameItemMap();
    const gameSoundtrackList = useGameSoundtrackList();

    /**
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(setMasterAccount);

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    /**
     * Load initial filter options from local storage. 
     */
    const initialFilterOptions = useMemo((): MasterItemStatsFilterOptions => {
        const localStorageData = StorageUtils.getItem<Partial<MasterItemStatsLocalUserPreferences>>(
            StorageKeys.LocalUserPreference.Route.MasterItemStats,
            getDefaultLocalUserPreferences
        );
        return {
            ...DefaultFilterOptions,
            ...localStorageData.filter
        };
    }, []);

    const [filter, updateFilter] = useReducer(filterReducer, initialFilterOptions);

    const stats: MasterItemStats | undefined = useMemo(() => {
        if (!masterAccount || !gameServantMap || !gameSoundtrackList || !filter) {
            return undefined;
        }
        return MasterItemStatsUtils.generateStats(gameServantMap, gameSoundtrackList, masterAccount, filter);
    }, [filter, gameServantMap, gameSoundtrackList, masterAccount]);

    const handleFilterOptionChange = useCallback((property: keyof MasterItemStatsFilterOptions, value: boolean): void => {
        updateFilter({ property, value });
    }, []);

    /*
     * This can be undefined during the initial render.
     */
    if (!stats || !gameItemMap || !filter) {
        return null;
    }

    /**
     * NavigationRail children
     */
    const navigationRailChildNodes = [
        <Tooltip key='items' title='Back to item list' placement='right'>
            <div>
                <IconButton
                    component={Link}
                    to='../master/items'
                    children={<Icon>format_list_bulleted</Icon>}
                    size='large' 
                />
            </div>
        </Tooltip>,
        <Tooltip key='export' title='Download item stats' placement='right'>
            <div>
                {/* TODO Implement this */}
                <IconButton
                    children={<Icon>get_app</Icon>}
                    size='large'
                    disabled
                />
            </div>
        </Tooltip>
    ];

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <div className={`${StyleClassPrefix}-upper-layout-container`}>
                <PageTitle>Item Stats</PageTitle>
                <MasterItemStatsFilterControls
                    filter={filter}
                    onFilterOptionChange={handleFilterOptionChange}
                />
            </div>
            <div className={`${StyleClassPrefix}-lower-layout-container`}>
                <NavigationRail
                    border
                    layout={sm ? 'column' : 'row'}
                >
                    {navigationRailChildNodes}
                </NavigationRail>
                <div className={`${StyleClassPrefix}-main-content`}>

                <div className={clsx(`${StyleClassPrefix}-table-container`, ThemeConstants.ClassScrollbarTrackBorder)}>
                    <MasterItemStatsTable
                        stats={stats}
                        gameItemMap={gameItemMap}
                        filter={filter}
                    />
                </div>
                </div>
            </div>
        </Box>
    );

});

import { Immutable, Nullable } from '@fgo-planner/common-core';
import { MasterAccount } from '@fgo-planner/data-core';
import { Icon, IconButton, Theme, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme as SystemTheme } from '@mui/system';
import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { Link } from 'react-router-dom';
import { NavigationRail } from '../../../../components/navigation/navigation-rail/NavigationRail';
import { PageTitle } from '../../../../components/text/PageTitle';
import { useGameItemMap } from '../../../../hooks/data/useGameItemMap';
import { useGameServantMap } from '../../../../hooks/data/useGameServantMap';
import { useGameSoundtrackList } from '../../../../hooks/data/useGameSoundtrackList';
import { useActiveBreakpoints } from '../../../../hooks/user-interface/useActiveBreakpoints';
import { ThemeConstants } from '../../../../styles/ThemeConstants';
import { StorageKeys } from '../../../../utils/storage/StorageKeys';
import { StorageUtils } from '../../../../utils/storage/StorageUtils';
import { SubscribablesContainer } from '../../../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../../../utils/subscription/SubscriptionTopics';
import { MasterItemStatsRouteFilterControls } from './components/MasterItemStatsRouteFilterControls';
import { MasterItemStatsRouteTable } from './components/MasterItemStatsRouteTable';
import { MasterItemStatsRouteTypes } from './MasterItemStatsRouteTypes';
import { MasterItemStatsRouteUtils } from './MasterItemStatsRouteUtils';

/**
 * User preferences for the master item stats route that are stored locally.
 */
type MasterItemStatsLocalUserPreferences = {
    filter: MasterItemStatsRouteTypes.FilterOptions;
};

type FilterReducerAction = {
    property: keyof MasterItemStatsRouteTypes.FilterOptions;
    value: boolean;
};

const DefaultFilterOptions: MasterItemStatsRouteTypes.FilterOptions = {
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
    currentState: MasterItemStatsRouteTypes.FilterOptions,
    action: FilterReducerAction
): MasterItemStatsRouteTypes.FilterOptions => {
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

const StyleClassPrefix = 'MasterItemStatsRoute';

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

    const [masterAccount, setMasterAccount] = useState<Nullable<Immutable<MasterAccount>>>();

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
    const initialFilterOptions = useMemo((): MasterItemStatsRouteTypes.FilterOptions => {
        // TODO Create hook for reading/writing preferences
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

    const stats: MasterItemStatsRouteTypes.ItemStats | undefined = useMemo(() => {
        if (!masterAccount || !gameServantMap || !gameSoundtrackList || !filter) {
            return undefined;
        }
        return MasterItemStatsRouteUtils.generateStats(gameServantMap, gameSoundtrackList, masterAccount, filter);
    }, [filter, gameServantMap, gameSoundtrackList, masterAccount]);

    const handleFilterOptionChange = useCallback((property: keyof MasterItemStatsRouteTypes.FilterOptions, value: boolean): void => {
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
                <MasterItemStatsRouteFilterControls
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
                        <MasterItemStatsRouteTable
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

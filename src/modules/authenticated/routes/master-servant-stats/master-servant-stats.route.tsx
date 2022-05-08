import { MasterAccount } from '@fgo-planner/types';
import { FormatListBulleted as FormatListBulletedIcon, GetApp as GetAppIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GameServantClassIcon } from '../../../../components/game/servant/game-servant-class-icon.component';
import { LayoutContentSection } from '../../../../components/layout/layout-content-section.component';
import { NavigationRail } from '../../../../components/navigation/navigation-rail/navigation-rail.component';
import { PageTitle } from '../../../../components/text/page-title.component';
import { useGameServantMap } from '../../../../hooks/data/use-game-servant-map.hook';
import { ThemeConstants } from '../../../../styles/theme-constants';
import { Nullable } from '../../../../types/internal';
import { SubscribablesContainer } from '../../../../utils/subscription/subscribables-container';
import { SubscriptionTopics } from '../../../../utils/subscription/subscription-topics';
import { MasterServantStatsFilter, MasterServantStatsFilterResult } from './master-servant-stats-filter.component';
import { MasterServantStatsTable, StyleClassPrefix as MasterServantStatsTableStyleClassPrefix } from './master-servant-stats-table.component';
import { MasterServantStatsGroupedByClass, MasterServantStatsGroupedByRarity, MasterServantStatsUtils } from './master-servant-stats.utils';

const OmitUnsummonedMessage = 'Un-summoned servants are omitted from stats calculation';

const renderRarityHeaderLabel = (value: string | number): ReactNode => {
    if (value === 'overall') {
        return 'Overall';
    }
    return `${value} \u2605`;
};

const renderClassHeaderLabel = (value: string | number): ReactNode => {
    if (value === 'overall') {
        return 'Overall';
    }
    return (
        <div className='flex justify-center'>
            <GameServantClassIcon
                servantClass={value as any}
                rarity={3}
                size={24}
                tooltip
                tooltipPlacement='top'
            />
        </div>
    );
};

const StyleClassPrefix = 'MasterServants';

const StyleProps = (theme: Theme) => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    [`& .${StyleClassPrefix}-contents`]: {
        display: 'flex',
        overflow: 'hidden'
    },
    [`& .${StyleClassPrefix}-main-content`]: {
        display: 'flex',
        flexDirection: 'column',
        flex: '1',
        [`& .${StyleClassPrefix}-filter-controls-row`]: {
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between'
        },
        [`& .${StyleClassPrefix}-omit-unsummoned-message`]: {
            color: theme.palette.warning.main,
            pr: 8
        },
        [`& .${StyleClassPrefix}-table-container`]: {
            pr: 4,
            py: 4,
            flex: 1,
            [`& .${MasterServantStatsTableStyleClassPrefix}-root`]: {
                height: '100%',
                overflow:'auto'
            }
        }
    }
} as SystemStyleObject<Theme>);

export const MasterServantStatsRoute = React.memo(() => {

    const [masterAccount, setMasterAccount] = useState<Nullable<MasterAccount>>();
    const [filter, setFilter] = useState<MasterServantStatsFilterResult>();

    const gameServantMap = useGameServantMap();

    /*
     * Master account change subscription.
     */
    useEffect(() => {
        const onCurrentMasterAccountChangeSubscription = SubscribablesContainer
            .get(SubscriptionTopics.User.CurrentMasterAccountChange)
            .subscribe(setMasterAccount);

        return () => onCurrentMasterAccountChangeSubscription.unsubscribe();
    }, []);

    const stats: MasterServantStatsGroupedByRarity | MasterServantStatsGroupedByClass | undefined = useMemo(() => {
        if (!gameServantMap || !masterAccount || !filter) {
            return undefined;
        }
        if (filter.groupBy === 'rarity') {
            return MasterServantStatsUtils.generateStatsGroupedByRarity(gameServantMap, masterAccount, filter);
        } else {
            return MasterServantStatsUtils.generateStatsGroupedByClass(gameServantMap, masterAccount, filter);
        }
    }, [gameServantMap, masterAccount, filter]);

    const hasUnsummonedServants: boolean = useMemo(() => {
        if (!masterAccount?.servants.length) {
            return false;
        }
        for (const { summoned } of masterAccount.servants) {
            if (summoned) {
                return true;
            }
        }
        return false;
    }, [masterAccount]);

    /**
     * NavigationRail children
     */
    const navigationRailChildNodes: ReactNode = useMemo(() => {
        return [
            <Tooltip key='servants' title='Back to servant list' placement='right'>
                <div>
                    <IconButton
                        component={Link}
                        to='../master/servants'
                        children={<FormatListBulletedIcon />}
                        size='large' />
                </div>
            </Tooltip>,
            <Tooltip key='export' title='Download servant stats' placement='right'>
                <div>
                    {/* TODO Implement this */}
                    <IconButton children={<GetAppIcon />} disabled size='large' />
                </div>
            </Tooltip>
        ];
    }, []);

    /*
     * Render the stats table.
     */
    const statsTableNode: ReactNode = useMemo(() => {
        if (!filter || !stats) {
            return null;
        }
        let dataColumnWidth: string;
        let headerLabelRenderer: (value: string | number) => ReactNode;
        if (filter.groupBy === 'rarity') {
            dataColumnWidth = '11%';
            headerLabelRenderer = renderRarityHeaderLabel;
        } else {
            dataColumnWidth = '8.5%';
            headerLabelRenderer = renderClassHeaderLabel;
        }
        return (
            <LayoutContentSection
                className={clsx(`${StyleClassPrefix}-table-container`, ThemeConstants.ClassScrollbarTrackBorder)}
                autoContentHeight
                layout='column'
            >
                <MasterServantStatsTable
                    stats={stats}
                    dataColumnWidth={dataColumnWidth}
                    headerLabelRenderer={headerLabelRenderer}
                />
            </LayoutContentSection>
        );
    }, [filter, stats]);

    return (
        <Box className={`${StyleClassPrefix}-root`} sx={StyleProps}>
            <PageTitle>Servant Stats</PageTitle>
            <div className={`${StyleClassPrefix}-contents`}>
                <NavigationRail children={navigationRailChildNodes} />
                <div className={`${StyleClassPrefix}-main-content`}>
                    <div className={`${StyleClassPrefix}-filter-controls-row`}>
                        <MasterServantStatsFilter onFilterChange={setFilter}></MasterServantStatsFilter>
                        {hasUnsummonedServants &&
                            <div className={`${StyleClassPrefix}-omit-unsummoned-message`}>
                                {OmitUnsummonedMessage}
                            </div>
                        }
                    </div>
                    {statsTableNode}
                </div>
            </div>
        </Box>
    );

});

import { Immutable, Nullable } from '@fgo-planner/common-core';
import { MasterAccount } from '@fgo-planner/data-core';
import { Icon, IconButton, Tooltip } from '@mui/material';
import { Box, SystemStyleObject, Theme } from '@mui/system';
import clsx from 'clsx';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutContentSection } from '../../../../components/layout/LayoutContentSection';
import { NavigationRail } from '../../../../components/navigation/navigation-rail/NavigationRail';
import { ServantClassIcon } from '../../../../components/servant/ServantClassIcon';
import { PageTitle } from '../../../../components/text/PageTitle';
import { useGameServantMap } from '../../../../hooks/data/useGameServantMap';
import { ThemeConstants } from '../../../../styles/ThemeConstants';
import { SubscribablesContainer } from '../../../../utils/subscription/SubscribablesContainer';
import { SubscriptionTopics } from '../../../../utils/subscription/SubscriptionTopics';
import { MasterServantStatsRouteFilterControls, MasterServantStatsRouteFilterControlsResult } from './components/MasterServantStatsRouteFilterControls';
import { MasterServantStatsRouteTable, StyleClassPrefix as MasterServantStatsRouteTableStyleClassPrefix } from './components/MasterServantStatsRouteTable';
import { MasterServantStatsRouteTypes } from './MasterServantStatsRouteTypes';
import { MasterServantStatsUtils } from './MasterServantStatsUtils';

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
            <ServantClassIcon
                servantClass={value as any}
                rarity={3}
                size={24}
                tooltip
                tooltipPlacement='top'
            />
        </div>
    );
};

const StyleClassPrefix = 'MasterServantStatsRoute';

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
            [`& .${MasterServantStatsRouteTableStyleClassPrefix}-root`]: {
                height: '100%',
                overflow: 'auto'
            }
        }
    }
} as SystemStyleObject<Theme>);

export const MasterServantStatsRoute = React.memo(() => {

    const [masterAccount, setMasterAccount] = useState<Nullable<Immutable<MasterAccount>>>();
    const [filter, setFilter] = useState<MasterServantStatsRouteFilterControlsResult>();

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

    const stats = useMemo((): MasterServantStatsRouteTypes.Stats | undefined => {
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
        const servantsData = masterAccount?.servants;
        if (!servantsData?.servants.length) {
            return false;
        }
        for (const { summoned } of servantsData.servants) {
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
                        size='large'
                    >
                        <Icon>format_list_bulleted</Icon>
                    </IconButton>
                </div>
            </Tooltip>,
            <Tooltip key='export' title='Download servant stats' placement='right'>
                <div>
                    {/* TODO Implement this */}
                    <IconButton
                        size='large'
                        disabled
                    >
                        <Icon>get_app</Icon>
                    </IconButton>
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
                <MasterServantStatsRouteTable
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
                <NavigationRail>{navigationRailChildNodes}</NavigationRail>
                <div className={`${StyleClassPrefix}-main-content`}>
                    <div className={`${StyleClassPrefix}-filter-controls-row`}>
                        <MasterServantStatsRouteFilterControls onFilterChange={setFilter}></MasterServantStatsRouteFilterControls>
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

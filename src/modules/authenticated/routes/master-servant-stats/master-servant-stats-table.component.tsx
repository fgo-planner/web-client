import React, { ReactNode, useMemo } from 'react';
import NumberFormat from 'react-number-format';
import { GameServantBondIcon } from '../../../../components/game/servant/game-servant-bond-icon.component';
import { GameServantConstants } from '@fgo-planner/data-constants';
import { MasterServantStatPanelData, MasterServantStatPanelRow, MasterServantStatsExpandablePanel } from './master-servant-stats-expandable-panel.component';
import { MasterServantStats } from './master-servant-stats.utils';

type Props = {
    stats: MasterServantStats<Record<string, number>>;
    dataColumnWidth?: string | number;
    headerLabelRenderer?: (value: string | number) => ReactNode;
};

const TotalServantsLabel = 'Total Servants';

const UniqueServantsLabel = 'Unique Servants';

const AverageNpLevelLabel = 'Average NP Level';

const TotalNpLevelsLabel = 'Total NP Levels';

const AverageAscensionLevelLabel = 'Average Ascension Level';

const AverageSkillLevelLabel = 'Average Skill Level';

const AverageAppendSkillLevelLabel = 'Average Append Skill Level';

const TripleNinesLabel = '9/9/9+ Servants';

const TripleTensLabel = '10/10/10 Servants';

const AverageBondLevelLabel = 'Average Bond Level';

const AverageFouLabel = 'Average Fou Enhancement';

const MaxHpFouLabel = 'Max HP Fous';

const MaxAtkFouLabel = 'Max Attack Fous';

const MaxGoldHpFouLabel = 'Max Gold HP Fous';

const MaxGoldAtkFouLabel = 'Max Gold Attack Fous';

const DoubleMaxFouLabel = '1000/1000 Servants';

const DoubleMaxGoldFouLabel = '2000/2000 Servants';

const applyFormatOneDecimal = (value: number): ReactNode => (
    <NumberFormat
        value={value}
        decimalScale={1}
        fixedDecimalScale
        displayType='text'
    />
);

const applyFormatThreeDecimals = (value: number): ReactNode => (
    <NumberFormat
        value={value}
        decimalScale={3}
        fixedDecimalScale
        displayType='text'
    />
);

export const StyleClassPrefix = 'MasterServantStatsTable';

export const MasterServantStatsTable = React.memo((props: Props) => {

    const {
        stats,
        dataColumnWidth,
        headerLabelRenderer
    } = props;

    const {
        totalCount,
        uniqueCount,
        npLevels,
        averageNpLevel,
        ascensionLevels,
        averageAscensionLevel,
        skillLevels,
        averageSkillLevel,
        tripleNineSkillsCount,
        tripleTenSkillsCount,
        appendSkillLevels,
        tripleNineAppendSkillsCount,
        tripleTenAppendSkillsCount,
        averageAppendSkillLevel,
        maxHpFouCount,
        maxAtkFouCount,
        maxGoldHpFouCount,
        maxGoldAtkFouCount,
        doubleMaxFouCount,
        doubleMaxGoldFouCount,
        averageFou,
        bondLevels,
        averageBondLevel
    } = stats;

    const headerData: MasterServantStatPanelData = useMemo(() => {
        /*
         * We can use `totalCount` here because all of the stat sets should have the
         * same keys.
         */
        const values = Object.keys(totalCount).map((key: string) => {
            if (headerLabelRenderer) {
                return headerLabelRenderer(key);
            } else {
                return key === 'overall' ? 'Overall' : key;
            }
        });
        return { header: { values } };
    }, [headerLabelRenderer, totalCount]);

    const totalServantsData: MasterServantStatPanelData = useMemo(() => {
        const header: MasterServantStatPanelRow = {
            label: TotalServantsLabel,
            values: Object.values(totalCount)
        };
        return { header };
    }, [totalCount]);

    const uniqueServantsData: MasterServantStatPanelData = useMemo(() => {
        const header: MasterServantStatPanelRow = {
            label: UniqueServantsLabel,
            values: Object.values(uniqueCount)
        };
        return { header };
    }, [uniqueCount]);

    const npLevelData: MasterServantStatPanelData = useMemo(() => {
        const header: MasterServantStatPanelRow = {
            label: AverageNpLevelLabel,
            values: Object.values(averageNpLevel).map(applyFormatThreeDecimals)
        };
        const rows: MasterServantStatPanelRow[] = [];
        for (const [key, value] of Object.entries(npLevels)) {
            rows.push({
                label: key === 'total' ? TotalNpLevelsLabel : `NP ${key} Servants`,
                values: Object.values(value)
            });
        }
        return { header, rows };
    }, [averageNpLevel, npLevels]);

    const ascensionLevelData: MasterServantStatPanelData = useMemo(() => {
        const header: MasterServantStatPanelRow = {
            label: AverageAscensionLevelLabel,
            values: Object.values(averageAscensionLevel).map(applyFormatThreeDecimals)
        };
        const rows: MasterServantStatPanelRow[] = [];
        for (const [key, value] of Object.entries(ascensionLevels)) {
            rows.push({
                label: `Ascension ${key} Servants`,
                values: Object.values(value)
            });
        }
        return { header, rows };
    }, [ascensionLevels, averageAscensionLevel]);

    const skillLevelData: MasterServantStatPanelData = useMemo(() => {
        const header: MasterServantStatPanelRow = {
            label: AverageSkillLevelLabel,
            values: Object.values(averageSkillLevel).map(applyFormatThreeDecimals)
        };
        const rows: MasterServantStatPanelRow[] = [];
        for (const [key, value] of Object.entries(skillLevels)) {
            rows.push({
                label: `Level ${key} Skills`,
                values: Object.values(value)
            });
        }
        rows.push({
            label: TripleNinesLabel,
            values: Object.values(tripleNineSkillsCount)
        });
        rows.push({
            label: TripleTensLabel,
            values: Object.values(tripleTenSkillsCount)
        });
        return { header, rows };
    }, [averageSkillLevel, skillLevels, tripleNineSkillsCount, tripleTenSkillsCount]);

    const appendSkillLevelData: MasterServantStatPanelData = useMemo(() => {
        const header: MasterServantStatPanelRow = {
            label: AverageAppendSkillLevelLabel,
            values: Object.values(averageAppendSkillLevel).map(applyFormatThreeDecimals)
        };
        const rows: MasterServantStatPanelRow[] = [];
        for (const [key, value] of Object.entries(appendSkillLevels)) {
            rows.push({
                label: `Level ${key} Append Skills`,
                values: Object.values(value)
            });
        }
        rows.push({
            label: TripleNinesLabel,
            values: Object.values(tripleNineAppendSkillsCount)
        });
        rows.push({
            label: TripleTensLabel,
            values: Object.values(tripleTenAppendSkillsCount)
        });
        return { header, rows };
    }, [appendSkillLevels, averageAppendSkillLevel, tripleNineAppendSkillsCount, tripleTenAppendSkillsCount]);

    const bondLevelData: MasterServantStatPanelData = useMemo(() => {
        const header: MasterServantStatPanelRow = {
            label: AverageBondLevelLabel,
            values: Object.values(averageBondLevel).map(applyFormatThreeDecimals)
        };
        const rows: MasterServantStatPanelRow[] = [];
        for (const bondLevel of GameServantConstants.BondLevels) {
            rows.push({
                label: (
                    <div className='flex'>
                        <GameServantBondIcon bond={bondLevel} size={20} />
                        <div className='pl-2'>
                            {bondLevel}
                        </div>
                    </div>
                ),
                values: Object.values(bondLevels[bondLevel])
            });
        }
        return { header, rows };
    }, [averageBondLevel, bondLevels]);

    const fouEnhancementData: MasterServantStatPanelData = useMemo(() => {
        const header: MasterServantStatPanelRow = {
            label: AverageFouLabel,
            values: Object.values(averageFou).map(applyFormatOneDecimal)
        };
        const rows: MasterServantStatPanelRow[] = [];
        rows.push({
            label: MaxHpFouLabel,
            values: Object.values(maxHpFouCount)
        });
        rows.push({
            label: MaxAtkFouLabel,
            values: Object.values(maxAtkFouCount)
        });
        rows.push({
            label: MaxGoldHpFouLabel,
            values: Object.values(maxGoldHpFouCount)
        });
        rows.push({
            label: MaxGoldAtkFouLabel,
            values: Object.values(maxGoldAtkFouCount)
        });
        rows.push({
            label: DoubleMaxFouLabel,
            values: Object.values(doubleMaxFouCount)
        });
        rows.push({
            label: DoubleMaxGoldFouLabel,
            values: Object.values(doubleMaxGoldFouCount)
        });
        return { header, rows };
    }, [averageFou, doubleMaxFouCount, doubleMaxGoldFouCount, maxAtkFouCount, maxGoldAtkFouCount, maxGoldHpFouCount, maxHpFouCount]);

    const expandablePanelNodes: ReactNode = [
        <MasterServantStatsExpandablePanel
            key='totalServantsData'
            data={totalServantsData}
            dataColumnWidth={dataColumnWidth}
        />,
        <MasterServantStatsExpandablePanel
            key='uniqueServantsData'
            data={uniqueServantsData}
            dataColumnWidth={dataColumnWidth}
            borderTop
        />,
        <MasterServantStatsExpandablePanel
            key='npLevelData'
            data={npLevelData}
            dataColumnWidth={dataColumnWidth}
            borderTop
        />,
        <MasterServantStatsExpandablePanel
            key='ascensionLevelData'
            data={ascensionLevelData}
            dataColumnWidth={dataColumnWidth}
            borderTop
        />,
        <MasterServantStatsExpandablePanel
            key='skillLevelData'
            data={skillLevelData}
            dataColumnWidth={dataColumnWidth}
            borderTop
        />,
        <MasterServantStatsExpandablePanel
            key='appendSkillLevelData'
            data={appendSkillLevelData}
            dataColumnWidth={dataColumnWidth}
            borderTop
        />,
        <MasterServantStatsExpandablePanel
            key='bondLevelData'
            data={bondLevelData}
            dataColumnWidth={dataColumnWidth}
            borderTop
        />,
        <MasterServantStatsExpandablePanel
            key='fouEnhancementData'
            data={fouEnhancementData}
            dataColumnWidth={dataColumnWidth}
            borderTop
        />
    ];

    return (
        <div className={`${StyleClassPrefix}-root`}>
            <MasterServantStatsExpandablePanel
                key='headerData'
                data={headerData}
                dataColumnWidth={dataColumnWidth}
                borderBottom
            />
            {expandablePanelNodes}
        </div>
    );

});

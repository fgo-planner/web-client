import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import React, { ReactNode, useState } from 'react';
import NumberFormat from 'react-number-format';
import { GameServantBondIcon } from '../../../../components/game/servant/game-servant-bond-icon.component';
import { GameServantConstants } from '../../../../constants';
import { WithStylesProps } from '../../../../types';
import { StyleUtils } from '../../../../utils/style.utils';
import { MasterServantStatsExpandablePanel } from './master-servant-expandable-stats.component';
import { MasterServantStats } from './master-servant-stats.utils';

type Props = {
    stats: MasterServantStats<Record<string, number>>;
    dataColumnWidth?: string | number;
    headerLabelRenderer?: (value: string | number) => ReactNode;
} & WithStylesProps;

type AccordionExpansionStates = {
    npLevels: boolean,
    ascensionLevels: boolean,
    skillLevels: boolean,
    fouEnhancement: boolean,
    bondLevels: boolean
};

const DefaultColumnWidth = '6.9%';

export const MasterServantStatsTable = React.memo((props: Props) => {
    const {
        classes,
        stats,
        dataColumnWidth,
        headerLabelRenderer
    } = props;

    const [accordionStates, setAccordionStates] = useState<AccordionExpansionStates>({
        npLevels: false,
        ascensionLevels: false,
        skillLevels: false,
        fouEnhancement: false,
        bondLevels: false
    });

    const toggleAccordion = (name: keyof AccordionExpansionStates): void => {
        const state = accordionStates[name];
        setAccordionStates({
            ...accordionStates,
            [name]: !state
        });
    };

    const toggleNpLevelsAccordion = (): void => {
        toggleAccordion('npLevels');
    };

    const toggleAscensionLevelsAccordion = (): void => {
        toggleAccordion('ascensionLevels');
    };

    const toggleSkillLevelsAccordion = (): void => {
        toggleAccordion('skillLevels');
    };

    const toggleFouEnhancementAccordion = (): void => {
        toggleAccordion('fouEnhancement');
    };

    const toggleBondLevelsAccordion = (): void => {
        toggleAccordion('bondLevels');
    };

    const {
        totalCount,
        uniqueCount,
        npLevels,
        averageNpLevel,
        ascensionLevels,
        averageAscensionLevel,
        skillLevels,
        averageSkillLevel,
        tripleNinesCount,
        tripleTensCount,
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

    // All the sub-stats should have the same keys.
    const statKeys = Object.keys(totalCount);

    const expandableDataRowClassNames = StyleUtils.appendClassNames(classes.dataRow, classes.expandable);
    const columnWidth = dataColumnWidth ?? DefaultColumnWidth;

    const renderHeaderCell = (key: string) => {
        let headerLabel: ReactNode;
        if (headerLabelRenderer) {
            headerLabel = headerLabelRenderer(key);
        } else {
            headerLabel = key === 'overall' ? 'Overall' : key;
        }
        return (
            <TableCell key={key} align="center" width={columnWidth}>
                {headerLabel}
            </TableCell>
        );
    };

    return (
        <TableContainer className={classes.tableContainer}>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell />
                        {statKeys.map(renderHeaderCell)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow className={classes.dataRow}>
                        <TableCell component="th">
                            Total Servants
                        </TableCell>
                        {statKeys.map(key => (
                            <TableCell key={key} align="center">
                                {totalCount[key]}
                            </TableCell>
                        ))}
                    </TableRow>
                    <TableRow className={classes.dataRow}>
                        <TableCell component="th">
                            Unique Servants
                        </TableCell>
                        {statKeys.map(key => (
                            <TableCell key={key} align="center">
                                {uniqueCount[key]}
                            </TableCell>
                        ))}
                    </TableRow>
                    <TableRow className={expandableDataRowClassNames}>
                        <TableCell component="th" onClick={toggleNpLevelsAccordion}>
                            Average NP Level
                        </TableCell>
                        {statKeys.map(key => (
                            <TableCell
                                key={key}
                                align="center"
                                width={columnWidth}
                                onClick={toggleNpLevelsAccordion}
                            >
                                <NumberFormat
                                    value={averageNpLevel[key]}
                                    decimalScale={3}
                                    fixedDecimalScale
                                    displayType="text"
                                />
                            </TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </Table>

            <MasterServantStatsExpandablePanel expanded={accordionStates.npLevels}>
                <Table className={classes.table}>
                    <TableBody className={classes.accordionTableBody}>
                        {GameServantConstants.NoblePhantasmLevels.map(level => (
                            <TableRow key={level} className={classes.dataRow}>
                                <TableCell component="th" className={classes.accordionFirstCell}>
                                    {`NP${level}`}
                                </TableCell>
                                {statKeys.map(key => (
                                    <TableCell key={key} align="center" width={columnWidth}>
                                        {npLevels[level][key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        <TableRow className={classes.dataRow}>
                            <TableCell component="th" className={classes.accordionFirstCell}>
                                Total NP Levels
                                </TableCell>
                            {statKeys.map(key => (
                                <TableCell key={key} align="center">
                                    {npLevels.total[key]}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </MasterServantStatsExpandablePanel>

            <Table className={classes.table}>
                <TableBody>
                    <TableRow className={expandableDataRowClassNames}>
                        <TableCell component="th" onClick={toggleAscensionLevelsAccordion}>
                            Average Ascension Level
                        </TableCell>
                        {statKeys.map(key => (
                            <TableCell
                                key={key}
                                align="center"
                                width={columnWidth}
                                onClick={toggleAscensionLevelsAccordion}
                            >
                                <NumberFormat
                                    value={averageAscensionLevel[key]}
                                    decimalScale={3}
                                    fixedDecimalScale
                                    displayType="text"
                                />
                            </TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </Table>

            <MasterServantStatsExpandablePanel expanded={accordionStates.ascensionLevels}>
                <Table className={classes.table}>
                    <TableBody className={classes.accordionTableBody}>
                        {GameServantConstants.AscensionLevels.map(level => (
                            <TableRow key={level} className={classes.dataRow}>
                                <TableCell component="th" className={classes.accordionFirstCell}>
                                    {`Ascension ${level}`}
                                </TableCell>
                                {statKeys.map(key => (
                                    <TableCell key={key} align="center" width={columnWidth}>
                                        {ascensionLevels[level][key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </MasterServantStatsExpandablePanel>

            <Table className={classes.table}>
                <TableBody>
                    <TableRow className={expandableDataRowClassNames}>
                        <TableCell component="th" onClick={toggleSkillLevelsAccordion}>
                            Average Skill Level
                        </TableCell>
                        {statKeys.map(key => (
                            <TableCell
                                key={key}
                                align="center"
                                width={columnWidth}
                                onClick={toggleSkillLevelsAccordion}
                            >
                                <NumberFormat
                                    value={averageSkillLevel[key]}
                                    decimalScale={3}
                                    fixedDecimalScale
                                    displayType="text"
                                />
                            </TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </Table>

            <MasterServantStatsExpandablePanel expanded={accordionStates.skillLevels}>
                <Table className={classes.table}>
                    <TableBody className={classes.accordionTableBody}>
                        {GameServantConstants.SkillLevels.map(level => (
                            <TableRow key={level} className={classes.dataRow}>
                                <TableCell component="th" className={classes.accordionFirstCell}>
                                    {`Level ${level} Skills`}
                                </TableCell>
                                {statKeys.map(key => (
                                    <TableCell key={key} align="center" width={columnWidth}>
                                        {skillLevels[level][key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        <TableRow className={classes.dataRow}>
                            <TableCell component="th" className={classes.accordionFirstCell}>
                                9/9/9+ Servants
                            </TableCell>
                            {statKeys.map(key => (
                                <TableCell key={key} align="center">
                                    {tripleNinesCount[key]}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow className={classes.dataRow}>
                            <TableCell component="th" className={classes.accordionFirstCell}>
                                10/10/10 Servants
                            </TableCell>
                            {statKeys.map(key => (
                                <TableCell key={key} align="center">
                                    {tripleTensCount[key]}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </MasterServantStatsExpandablePanel>

            <Table className={classes.table}>
                <TableBody>
                    <TableRow className={expandableDataRowClassNames}>
                        <TableCell component="th" onClick={toggleBondLevelsAccordion}>
                            Average Bond Level
                        </TableCell>
                        {statKeys.map(key => (
                            <TableCell
                                key={key}
                                align="center"
                                width={columnWidth}
                                onClick={toggleBondLevelsAccordion}
                            >
                                <NumberFormat
                                    value={averageBondLevel[key]}
                                    decimalScale={3}
                                    fixedDecimalScale
                                    displayType="text"
                                />
                            </TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </Table>

            <MasterServantStatsExpandablePanel expanded={accordionStates.bondLevels}>
                <Table className={classes.table}>
                    <TableBody className={classes.accordionTableBody}>
                        {GameServantConstants.BondLevels.map(level => (
                            <TableRow key={level} className={classes.dataRow}>
                                <TableCell component="th" className={classes.accordionFirstCell}>
                                    <div className="flex">
                                        <GameServantBondIcon bond={level} size={20} />
                                        <div className="pl-2">
                                            {level}
                                        </div>
                                    </div>
                                </TableCell>
                                {statKeys.map(key => (
                                    <TableCell key={key} align="center" width={columnWidth}>
                                        {bondLevels[level][key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </MasterServantStatsExpandablePanel>


            <Table className={classes.table}>
                <TableBody>
                    <TableRow className={expandableDataRowClassNames}>
                        <TableCell component="th" onClick={toggleFouEnhancementAccordion}>
                            Average Fou Enhancement
                        </TableCell>
                        {statKeys.map(key => (
                            <TableCell
                                key={key}
                                align="center"
                                width={columnWidth}
                                onClick={toggleFouEnhancementAccordion}
                            >
                                <NumberFormat
                                    value={averageFou[key]}
                                    decimalScale={1}
                                    fixedDecimalScale
                                    displayType="text"
                                />
                            </TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </Table>

            <MasterServantStatsExpandablePanel expanded={accordionStates.fouEnhancement}>
                <Table className={classes.table}>
                    <TableBody className={classes.accordionTableBody}>
                        <TableRow className={classes.dataRow}>
                            <TableCell component="th" className={classes.accordionFirstCell}>
                                Max HP Fous
                            </TableCell>
                            {statKeys.map(key => (
                                <TableCell key={key} align="center" width={columnWidth}>
                                    {maxHpFouCount[key]}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow className={classes.dataRow}>
                            <TableCell component="th" className={classes.accordionFirstCell}>
                                Max Attack Fous
                            </TableCell>
                            {statKeys.map(key => (
                                <TableCell key={key} align="center" width={columnWidth}>
                                    {maxAtkFouCount[key]}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow className={classes.dataRow}>
                            <TableCell component="th" className={classes.accordionFirstCell}>
                                Max Gold HP Fous
                            </TableCell>
                            {statKeys.map(key => (
                                <TableCell key={key} align="center" width={columnWidth}>
                                    {maxGoldHpFouCount[key]}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow className={classes.dataRow}>
                            <TableCell component="th" className={classes.accordionFirstCell}>
                                Max Gold Attack Fous
                            </TableCell>
                            {statKeys.map(key => (
                                <TableCell key={key} align="center" width={columnWidth}>
                                    {maxGoldAtkFouCount[key]}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow className={classes.dataRow}>
                            <TableCell component="th" className={classes.accordionFirstCell}>
                                1000/1000 Servants
                            </TableCell>
                            {statKeys.map(key => (
                                <TableCell key={key} align="center" width={columnWidth}>
                                    {doubleMaxFouCount[key]}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow className={classes.dataRow}>
                            <TableCell component="th" className={classes.accordionFirstCell}>
                                2000/2000 Servants
                            </TableCell>
                            {statKeys.map(key => (
                                <TableCell key={key} align="center" width={columnWidth}>
                                    {doubleMaxGoldFouCount[key]}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </MasterServantStatsExpandablePanel>

        </TableContainer>
    );
});

import {
    Accordion as MuiAccordion,
    AccordionDetails as MuiAccordionDetails,
    AccordionSummary as MuiAccordionSummary,
    alpha,
    Theme,
} from '@mui/material';
import { StyleRules, WithStylesOptions } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import clsx from 'clsx';
import React, { CSSProperties, PropsWithChildren, ReactNode, useCallback, useMemo, useState } from 'react';
import { StyleUtils } from '../../../../utils/style.utils';

type Props = PropsWithChildren<{
    data: MasterServantStatPanelData;
    dataColumnWidth?: number | string;
    borderTop?: boolean;
    borderBottom?: boolean;
}>;

export type MasterServantStatPanelData = {
    header: MasterServantStatPanelRow;
    rows?: Array<MasterServantStatPanelRow>;
};

export type MasterServantStatPanelRow = {
    label?: number | string | ReactNode;
    values: Array<number | string | ReactNode>;
};

const DefaultDataColumnWidth = '6.9%';

const Accordion = withStyles({
    root: {
        '&:before': {
            display: 'none',
        },
        '&$expanded': {
            margin: 'auto',
        },
    },
    expanded: {} // Do not delete this
})(MuiAccordion);

const AccordionSummary = withStyles({
    root: {
        padding: 0,
        minHeight: 52,
        '&$expanded': {
            minHeight: 52
        }
    },
    content: {
        margin: 0,
        '&$expanded': {
            margin: 0
        },
    },
    expanded: {} // Do not delete this
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
    root: {
        padding: theme.spacing(0),
        backgroundColor: alpha(theme.palette.background.default, 0.5),
        boxShadow: StyleUtils.insetBoxShadow(theme.shadows[1]),
    },
}))(MuiAccordionDetails);

const style = (theme: Theme) => ({
    row: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: 52,
        padding: theme.spacing(0, 4),
        fontSize: '0.875rem',
        '&:hover': {
            backgroundColor: alpha(theme.palette.text.primary, 0.07)
        }
    },
    detailRow: {
        '&:not(:last-child)': {
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: theme.palette.divider
        }
    },
    borderTop: {
        borderTopWidth: 1,
        borderTopStyle: 'solid',
        borderTopColor: theme.palette.divider,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: theme.palette.divider,
    },
    notExpandable: {
        cursor: 'default'
    },
    rowLabel: {
        flex: 1,
    },
    rowValue: {

    }
} as StyleRules);

const styleOptions: WithStylesOptions<Theme> = {
    classNamePrefix: 'MasterServantStatsExpandablePanel'
};

const useStyles = makeStyles(style, styleOptions);

export const MasterServantStatsExpandablePanel = React.memo((props: Props) => {

    const {
        data,
        dataColumnWidth,
        borderTop,
        borderBottom
    } = props;

    const { header, rows } = data;

    const classes = useStyles();

    const [expanded, setExpanded] = useState<boolean>(false);

    const dataCellStyle: CSSProperties = useMemo(() => ({
        width: dataColumnWidth || DefaultDataColumnWidth,
        textAlign: 'center'
    }), [dataColumnWidth]);

    const handleHeaderClick = useCallback(() => {
        if (!rows?.length) {
            return;
        }
        setExpanded(!expanded);
    }, [expanded, rows]);

    const renderDetailRow = (rowData: MasterServantStatPanelRow): ReactNode => {
        return (
            <div className={clsx(classes.row, classes.detailRow)}>
                <div className={clsx(classes.rowLabel, 'truncate', 'ml-4')}>
                    {rowData.label}
                </div>
                {rowData.values.map(value => (
                    <div style={dataCellStyle}>
                        {value}
                    </div>
                ))}
            </div>
        );
    };

    const headerRowClassName = clsx(
        classes.row,
        !rows && classes.notExpandable,
        borderTop && classes.borderTop,
        borderBottom && classes.borderBottom,
    );

    return (
        <Accordion square expanded={expanded} onChange={handleHeaderClick}>
            <AccordionSummary>
                <div className="full-width">
                    <div className={headerRowClassName}>
                        <div className={clsx(classes.rowLabel, 'truncate')}>
                            {header.label}
                        </div>
                        {header.values.map(value => (
                            <div style={dataCellStyle}>
                                {value}
                            </div>
                        ))}
                    </div>
                </div>
            </AccordionSummary>
            <AccordionDetails>
                <div className="full-width">
                    {rows?.map(row => renderDetailRow(row))}
                </div>
            </AccordionDetails>
        </Accordion>
    );
});

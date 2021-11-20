import { Accordion, AccordionDetails, AccordionSummary, alpha } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
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

const RowHeight = 52;

const DefaultDataColumnWidth = '6.9%';

const StyleClassPrefix = 'MasterServantStatsExpandablePanel';

const StyleProps = (theme: Theme) => ({
    '&.MuiAccordion-root': {
        '&:before': {
            display: 'none'
        },
        '&.Mui-expanded': {
            margin: 'auto',
        }
    },
    '& .MuiAccordionSummary-root': {
        padding: 0,
        minHeight: RowHeight,
        '&.Mui-expanded': {
            minHeight: RowHeight
        }
    },
    '& .MuiAccordionSummary-content': {
        margin: 0,
        '&.Mui-expanded': {
            margin: 0
        }
    },
    '& .MuiAccordionDetails-root': {
        padding: 0,
        backgroundColor: alpha(theme.palette.background.default, 0.5),
        boxShadow: StyleUtils.insetBoxShadow((theme.shadows as any)[1])
    },
    [`& .${StyleClassPrefix}-row`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: RowHeight,
        px: 4,
        fontSize: '0.875rem',
        '&:hover': {
            backgroundColor: alpha(theme.palette.text.primary, 0.07)
        },
        '&.border-top': {
            borderTopWidth: 1,
            borderTopStyle: 'solid',
            borderTopColor: 'divider',
        },
        '&.border-bottom': {
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: 'divider',
        },
        '&.not-expandable': {
            cursor: 'default'
        }
    },
    [`& .${StyleClassPrefix}-detail-row`]: {
        '&:not(:last-child)': {
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: 'divider'
        },
        [`& .${StyleClassPrefix}-row-label`]: {
            ml: 4
        }
    },
    [`& .${StyleClassPrefix}-row-label`]: {
        flex: 1
    }
} as SystemStyleObject<Theme>);

export const MasterServantStatsExpandablePanel = React.memo((props: Props) => {

    const {
        data,
        dataColumnWidth,
        borderTop,
        borderBottom
    } = props;

    const { header, rows } = data;

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
            <div className={clsx(`${StyleClassPrefix}-row`, `${StyleClassPrefix}-detail-row`)}>
                <div className={clsx(`${StyleClassPrefix}-row-label`, 'truncate')}>
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
        `${StyleClassPrefix}-row`,
        !rows && 'not-expandable',
        borderTop && 'border-top',
        borderBottom && 'border-bottom',
    );

    return (
        <Accordion
            className={`${StyleClassPrefix}-root`}
            sx={StyleProps}
            expanded={expanded}
            onChange={handleHeaderClick}
            square
        >
            <AccordionSummary>
                <div className="full-width">
                    <div className={headerRowClassName}>
                        <div className={clsx(`${StyleClassPrefix}-row-label`, 'truncate')}>
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

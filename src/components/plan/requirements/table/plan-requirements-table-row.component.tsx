import { FilteringStyledOptions } from '@mui/styled-engine';
import { styled } from '@mui/system';
import clsx from 'clsx';
import React, { CSSProperties, ReactNode, useMemo } from 'react';
import { PlanRequirementsTableOptionsInternal } from './plan-requirements-table-options-internal.type';

type Props = {
    borderBottom?: boolean;
    borderTop?: boolean;
    options: PlanRequirementsTableOptionsInternal;
    stickyColumn?: ReactNode;
    scrollContents: ReactNode;
};

const StickyColumnWidthCondensed = 69;
const StickyColumnWidthNormal = 320;

export const StyleClassPrefix = 'PlanRequirementsTableRow';

export const PlanRequirementsTableRow = React.memo((props: Props) => {

    const {
        borderBottom,
        borderTop,
        options,
        stickyColumn,
        scrollContents
    } = props;

    const stickyColumnStyle = useMemo((): CSSProperties => ({
        width: options.stickyColumnLayout === 'condensed' ? StickyColumnWidthCondensed : StickyColumnWidthNormal
    }), [options.stickyColumnLayout]);

    return (
        <div className={clsx(`${StyleClassPrefix}-root`, borderTop && 'border-top', borderBottom && 'border-bottom')}>
            <div className={`${StyleClassPrefix}-sticky-column-container`} style={stickyColumnStyle}>
                {stickyColumn}
            </div>
            <div className={`${StyleClassPrefix}-scroll-container`}>
                <div className={`${StyleClassPrefix}-scroll-contents`}>
                    {scrollContents}
                </div>
            </div>
        </div>
    );

});


const StyleOptions = {
    name: StyleClassPrefix,
    slot: 'root',
    skipSx: true,
    shouldForwardProp: ((prop: string) => (
        prop !== 'borderTop' &&
        prop !== 'borderBottom'
    )) as unknown
} as FilteringStyledOptions<Props>;

export const PlanRequirementsTableRowOld = styled('div', StyleOptions)<Props>(props => {
    const {
        borderBottom,
        borderTop,
        theme
    } = props;

    const style = {
        display: 'flex',
        width: 'fit-content'
    } as CSSProperties;

    if (borderTop) {
        style.borderTopWidth = 1;
        style.borderTopStyle = 'solid';
        style.borderTopColor = theme.palette.divider;
    }
    if (borderBottom) {
        style.borderBottomWidth = 1;
        style.borderBottomStyle = 'solid';
        style.borderBottomColor = theme.palette.divider;
    }

    return style as any;
});
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

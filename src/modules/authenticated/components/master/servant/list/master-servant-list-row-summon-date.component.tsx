import { ReadonlyDate } from '@fgo-planner/common-core';
import React from 'react';
import { DateTimeFormatUtils } from '../../../../../../utils/format/date-time-format.utils';

type Props = {
    date?: ReadonlyDate; 
};

export const StyleClassPrefix = 'MasterServantListRowSummonDate';

export const MasterServantListRowSummonDate = React.memo(({ date }: Props) => {
    return (
        <div className={`${StyleClassPrefix}-root`}>
            {date === undefined ? '\u2014' : DateTimeFormatUtils.formatSummonDate(date)}
        </div>
    );
});

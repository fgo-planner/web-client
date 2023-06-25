import React from 'react';
import { DateTimeFormatUtils } from '../../../../../../utils/format/DateTimeFormatUtils';

type Props = {
    date?: string;
};

export const StyleClassPrefix = 'MasterServantListRowSummonDate';

export const MasterServantListRowSummonDate = React.memo(({ date }: Props) => {
    return (
        <div className={`${StyleClassPrefix}-root`}>
            {date === undefined ? '\u2014' : DateTimeFormatUtils.formatSummonDate(date)}
        </div>
    );
});

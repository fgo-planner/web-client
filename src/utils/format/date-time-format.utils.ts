import { DateTimeUtils, Nullable, ReadonlyDate } from '@fgo-planner/common-core';
import { format } from 'date-fns';

type AnyDate = Date | ReadonlyDate;

export class DateTimeFormatUtils {

    // static readonly DataTableFormat = 'MMM dd, yyyy hh:mm:ss a';
    static readonly DataTableFormat = 'yyyy-MM-dd hh:mm:ss a';

    static readonly SummonDateFormat = 'yyyy-MM-dd';

    private constructor () {
        
    }

    static formatForDataTable(date: Nullable<AnyDate | number>): string {
        if (date == null) {
            return '';
        }
        return format(date as number | Date, this.DataTableFormat);
    }

    static formatSummonDate(date: Nullable<AnyDate | number>): string {
        if (date == null) {
            return '';
        }
        /**
         * The given value is expected to be relative to UTC time zone. We need to
         * convert the given value to local time zone to avoid returning the wrong date
         * due to timezone differences.
         */
        const zonedDate = DateTimeUtils.utcToZonedTime(date);
        return format(zonedDate, this.SummonDateFormat);
    }

}

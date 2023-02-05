import { DateTimeUtils, Nullable, ReadonlyDate } from '@fgo-planner/common-core';
import { format } from 'date-fns';

export namespace DateTimeFormatUtils {

    type AnyDate = Date | ReadonlyDate;
    
    // const DataTableFormat = 'MMM dd, yyyy hh:mm:ss a';
    const DataTableFormat = 'yyyy-MM-dd hh:mm:ss a';
    
    const SummonDateFormat = 'yyyy-MM-dd';
    
    export function formatForDataTable(date: Nullable<AnyDate | number>): string {
        if (date == null) {
            return '';
        }
        return format(date as number | Date, DataTableFormat);
    }

    export function formatSummonDate(date: Nullable<AnyDate | number>): string {
        if (date == null) {
            return '';
        }
        /**
         * The given value is expected to be relative to UTC time zone. We need to
         * convert the given value to local time zone to avoid returning the wrong date
         * due to timezone differences.
         */
        const zonedDate = DateTimeUtils.utcToZonedTime(date);
        return format(zonedDate, SummonDateFormat);
    }

}

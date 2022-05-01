import { millisecondsInSecond, secondsInMinute } from 'date-fns';
import { Immutable } from '../types/internal';

export class DateTimeUtils {

    private constructor () {
        
    }

    // private static readonly

    static cloneDate(date: Date | Immutable<Date> | undefined): Date | undefined {
        return date ? new Date(date as Date) : undefined;
    }

    /**
     * Truncates a `Date` such that its least significate unit is the date. In other
     * words, this sets the date's hours, minutes, seconds, and milliseconds all to
     * zero. A new `Date` instance is always returned.
     */
    static truncateToDate(date: Date | number): Date {
        const result = new Date(date);
        // TODO Maybe use a library for this.
        result.setHours(0);
        result.setMinutes(0);
        result.setSeconds(0);
        result.setMilliseconds(0);
        return result;
    }

    static utcToZonedTime(date: Date | number): Date {
        if (typeof date === 'number') {
            date = new Date(date);
        }
        const milliseconds = date.getTime() + date.getTimezoneOffset() * secondsInMinute * millisecondsInSecond;
        return new Date(milliseconds);
    }

    static zonedToUtcTime(date: Date | number): Date {
        if (typeof date === 'number') {
            date = new Date(date);
        }
        const milliseconds = date.getTime() - date.getTimezoneOffset() * secondsInMinute * millisecondsInSecond;
        return new Date(milliseconds);
    }

    /**
     * @deprecated Currently unused.
     */
    static getLocalTimeZone(): string {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

}

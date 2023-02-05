import { NumericFormatProps, numericFormatter } from 'react-number-format';

export namespace NumberFormatUtils {

    const FriendIdFormatProps: NumericFormatProps = {
        thousandSeparator: true
    };

    const QuantityFormatProps: NumericFormatProps = {
        thousandSeparator: true
    };

    export function formatFriendId(friendId?: string, defaultValue = ''): string {
        if (!friendId) {
            return defaultValue;
        }
        return numericFormatter(friendId, FriendIdFormatProps);
    }

    export function formatQuantity(value: number): string {
        return numericFormatter(String(value), QuantityFormatProps);
    }

    /**
     * Formats a number between 0 and 9,999,999,999 into a shorthand notation.
     */
    export function formatQuantityShort(value: number): string {
        if (value < 1_000) {
            return String(~~value);
        } else if (value < 10_000) {
            return (~~(value / 100) / 10).toFixed(1) + 'k';
        } else if (value < 1_000_000) {
            return ~~(value / 1_000) + 'k';
        } else if (value < 10_000_000) {
            return (~~(value / 100_000) / 10).toFixed(1) + 'm';
        } else if (value < 1_000_000_000) {
            return ~~(value / 1_000_000) + 'm';
        } else {
            return (~~(value / 100_000_000) / 10).toFixed(1) + 'b';
        }
    }

}

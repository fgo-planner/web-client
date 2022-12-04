import { NumericFormatProps, numericFormatter } from 'react-number-format';

const FriendIdFormatProps: NumericFormatProps = {
    thousandSeparator: true
};

const QuantityFormatProps: NumericFormatProps = {
    thousandSeparator: true
};

function formatFriendId(friendId?: string, defaultValue = ''): string {
    if (!friendId) {
        return defaultValue;
    }
    return numericFormatter(friendId, FriendIdFormatProps);
}

function formatQuantity(value: number): string {
    return numericFormatter(String(value), QuantityFormatProps);
}

/**
 * Formats a number between 0 and 9_999_999_999 into a shorthand notation.
 */
function formatQuantityShort(value: number): string {
    if (value < 1_000) {
        return String(~~value);
    } else if (value < 10_000) {
        return (value / 1_000).toFixed(1) + 'k';
    } else if (value < 1_000_000) {
        return ~~(value / 1_000) + 'k';
    } else if (value < 10_000_000) {
        return (value / 1_000_000).toFixed(1) + 'm';
    } else if (value < 1_000_000_000) {
        return ~~(value / 1_000_000) + 'm';
    } else {
        return (value / 1_000_000_000).toFixed(1) + 'b';
    }
}

export const NumberFormatUtils = { 
    formatFriendId,
    formatQuantity,
    formatQuantityShort
};

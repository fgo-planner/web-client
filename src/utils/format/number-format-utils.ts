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

export const NumberFormatUtils = { 
    formatFriendId,
    formatQuantity
};

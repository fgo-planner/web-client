import { Icon, IconProps } from '@mui/material';
import clsx from 'clsx';

/**
 * Wrapper for MUI's `Icon` component with the `material-icons-two-tone` style
 * class applied to enable the two-tone variant of material icons.
 */
export const IconTwoTone: React.FC<IconProps> = (props: IconProps): JSX.Element => {

    let {
        className,
        ...iconProps
    } = props;

    return (
        <Icon
            {...iconProps}
            className={clsx(className, 'material-icons-two-tone')}
        />
    );
    
};

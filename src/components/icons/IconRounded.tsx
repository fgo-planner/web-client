import { Icon, IconProps } from '@mui/material';
import clsx from 'clsx';

/**
 * Wrapper for MUI's `Icon` component with the `material-icons-rounded` style
 * class applied to enable the rounded variant of material icons.
 */
export const IconRounded: React.FC<IconProps> = (props: IconProps): JSX.Element => {

    let {
        className,
        ...iconProps
    } = props;

    return (
        <Icon
            {...iconProps}
            className={clsx(className, 'material-icons-rounded')}
        />
    );
    
};

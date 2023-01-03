import { Icon, IconProps } from '@mui/material';
import clsx from 'clsx';

/**
 * Wrapper for MUI's `Icon` component with the `material-icons-sharp` style
 * class applied to enable the sharp variant of material icons.
 */
export const IconSharp: React.FC<IconProps> = (props: IconProps): JSX.Element => {

    let {
        className,
        ...iconProps
    } = props;

    return (
        <Icon
            {...iconProps}
            className={clsx(className, 'material-icons-sharp')}
        />
    );
    
};

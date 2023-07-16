import { Icon, IconProps } from '@mui/material';
import clsx from 'clsx';

/**
 * Wrapper for MUI's `Icon` component with the `material-icons-outlined` style
 * class applied to enable the outlined variant of material icons.
 */
export const IconOutlined: React.FC<IconProps> = (props: IconProps): JSX.Element => {

    const {
        className,
        ...iconProps
    } = props;

    return (
        <Icon
            {...iconProps}
            className={clsx(className, 'material-icons-outlined')}
        />
    );

};

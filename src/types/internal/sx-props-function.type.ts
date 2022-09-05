import { Function } from '@fgo-planner/common-types';
import { SystemStyleObject, Theme } from '@mui/system';

// eslint-disable-next-line @typescript-eslint/ban-types
export type SxPropsFunction = Function<Theme, SystemStyleObject<Theme>>;

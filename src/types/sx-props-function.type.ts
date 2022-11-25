import { Function } from '@fgo-planner/common-core';
import { SystemStyleObject, Theme } from '@mui/system';

/**
 * @deprecated
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type SxPropsFunction = Function<Theme, SystemStyleObject<Theme>>;

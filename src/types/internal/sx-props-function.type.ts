import { SystemStyleObject, Theme } from '@mui/system';
import { Function } from './generics/functions.type';

// eslint-disable-next-line @typescript-eslint/ban-types
export type SxPropsFunction = Function<Theme, SystemStyleObject<Theme>>;

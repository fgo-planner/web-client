// eslint-disable-next-line @typescript-eslint/ban-types
export type Type<T = any> = Function & {
    new (...args: any[]): T;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type AbstractType<T = any> = Function & {
    prototype: T;
};

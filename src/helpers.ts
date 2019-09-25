export type TypedFunction<A, R> = (arg: A) => R;

export type FunctionOrValue<T> = T | (() => T);

/**
 * Returns true if type of value is function
 *
 * @param value
 */
export const isFunction = (value: unknown): boolean => {
  return typeof value === "function";
};

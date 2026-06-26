export type CallbackFunction<T> = (data: T) => Promise<void>;
// @TODO get rid of this promise!
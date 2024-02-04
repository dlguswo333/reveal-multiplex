/** Used as a key in localStorage. */
export const MASTER_TOKEN_KEY = 'revealjs-multiplex-master-token-key';

export const MASTER_TOKEN_PATH = '/master-token';

export const packageName = '@dlguswo333/reveal-multiplex';

/** Merge two configs respecting the second one. */
export const mergeConfigs = (a: Config, b: Config): Config => {
  const ret = {...a, ...b};
  return ret;
};

export enum MessageType {
  state = 'state',
}

export type Message = {
  type: MessageType;
  message: unknown;
  masterToken?: string;
}

export type Nullable<T> = T | null | undefined;

export type Config = {
  secret: Nullable<string>;
  host: Nullable<string>;
  port: Nullable<number>;
  staticDir: Nullable<string>;
}

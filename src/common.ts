/** Used as a key in localStorage. */
export const MASTER_TOKEN_KEY = 'revealjs-multiplex-master-token-key';

export const MASTER_TOKEN_PATH = '/master-token';

export const packageName = '@dlguswo333/reveal-multiplex';

/** Merge two configs respecting the second one but falsy values. */
export const mergeConfigs = (a: Config, b: Config): Config => {
  const ret = Object.keys(b).reduce((merged, key) => {
    merged[key] = b[key] || a[key];
    return merged;
  }, {} as Config);

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

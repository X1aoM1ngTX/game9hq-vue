import "pinia";

declare module "pinia" {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: {
      key?: string;
      storage?: Storage;
      paths?: string[];
    };
  }
}

declare module "pinia-plugin-persistedstate" {
  import { PiniaPluginContext } from "pinia";

  export interface PersistedStateOptions {
    key?: string;
    storage?: Storage;
    paths?: string[];
  }

  export default function(context: PiniaPluginContext): void;
}

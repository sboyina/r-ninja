import { check, PropsWatcher } from "./ninja";
import { internals } from "./internals";

export { PropsWatcher, NinjaContext, useWatcher, check } from "./ninja";
export { Watcher } from "./watcher";
export { useViewModel, ViewModel } from "./viewmodel";

export default {
    PropsWatcher,
    check,
    internals,
}

if (typeof window !== "undefined") {
    (window as any)['RNINJA'] = {...internals, check};
}
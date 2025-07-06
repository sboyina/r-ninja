import { check, PropsWatcher } from "./ninja";
import { internals } from "./internals";
import { When } from "./components/when";

export { PropsWatcher, NinjaContext, useWatcher, check } from "./ninja";
export { Watcher } from "./watcher";
export { ViewModel } from "./viewmodel";
export { useViewModel, ViewmodelProvider } from "./hooks";

export default {
    PropsWatcher,
    When,
    check,
    internals,
}

if (typeof window !== "undefined") {
    (window as any)['RNINJA'] = {...internals, check};
}
import { check, PropsWatcher } from "./ninja";
import { internals } from "./internals";
import { When } from "./components/when";

export { PropsWatcher, NinjaContext, useWatcher, check } from "./ninja";
export { Watcher } from "./watcher";
export { useViewModel, ViewModel } from "./viewmodel";

export default {
    PropsWatcher,
    When,
    check,
    internals,
}

if (typeof window !== "undefined") {
    (window as any)['RNINJA'] = {...internals, check};
}
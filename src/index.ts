import { check, PropsWatcher } from "./components/ninja";
import { internals } from "./components/internals";

export { TextContent } from "./components/textcontent";
export { When } from "./components/when";
export { Repeat } from "./components/repeat";
export { PropsWatcher, NinjaContext, useWatcher, check } from "./components/ninja";
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
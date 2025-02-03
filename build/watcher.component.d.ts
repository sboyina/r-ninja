import React from "react";
import { Watcher } from "./watcher";
interface MemoProps {
    render: (watch: Function) => React.ReactNode;
}
interface MemoState {
    id: number;
}
export declare const doRefreshUI: () => void;
export declare const WatcherContext: React.Context<Watcher>;
export declare class PropsWatcher extends React.Component<MemoProps, MemoState> {
    private watcher;
    constructor(props: MemoProps);
    shouldComponentUpdate(nextProps: any, nextState: any): boolean;
    componentWillUnmount(): void;
    refresh: () => void;
    watch(fn: Function): any;
    render(): React.FunctionComponentElement<React.ConsumerProps<Watcher>>;
}
export declare function useWatcher(): {
    watch: (fn: Function) => any;
};
export {};

import React, { useContext, useState, useEffect } from "react";
import { Watcher } from "../watcher";

interface MemoProps {
    render: (watch: Function) => React.ReactNode
}

interface MemoState {
    id: number;
}

export const doRefreshUI = () => {
    Watcher.ROOT.check();
};

export const WatcherContext = React.createContext<Watcher>(null as any);

export class PropsWatcher extends React.Component<MemoProps, MemoState> {

    private watcher: Watcher = null as any;

    constructor(props: MemoProps) {
        super(props);
        this.state = {
            id: 0
        }
    }

    shouldComponentUpdate(nextProps: any, nextState: any) {
        return Object.keys(nextProps).reduce((p, k) => {
            return p || (k !== 'render' && (this.props as any)[k] !== nextProps[k]);
        }, false) || this.state.id !== nextState.id;
    }

    componentWillUnmount() {
        this.watcher && this.watcher.destroy();
    }

    refresh = () => {
        this.setState({
            id: this.state.id + 1
        });
    }

     watch(fn: Function) {
        return this.watcher.watch(fn, this.refresh).value;
     }

    render() {
        return React.createElement(WatcherContext.Consumer, null as any,
            ((parent: Watcher) => {
                parent = parent || Watcher.ROOT;
                this.watcher = this.watcher || parent.create();
                this.watcher.clear();
                return React.createElement(WatcherContext.Provider, {
                    "value" : this.watcher 
                }, [this.props.render(this.watch.bind(this))])
            }) as any);
    }
}

export function useWatcher() {
    const parent = useContext(WatcherContext);
    const [change, onChange] = useState({});
    let [ watcher ] = useState(() => parent.create());
    watcher.clear();
    useEffect(() => { 
        return () => {
            watcher.destroy();
        };
    }, [watcher]);
    return {
        watch: (fn: Function) => {
            return watcher.watch(fn, () => onChange({})).value;
        }
    };
};
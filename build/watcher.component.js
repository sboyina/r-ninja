import React, { useContext, useState, useEffect } from "react";
import { Watcher } from "./watcher";
export const doRefreshUI = () => {
    Watcher.ROOT.check();
};
export const WatcherContext = React.createContext(null);
export class PropsWatcher extends React.Component {
    constructor(props) {
        super(props);
        this.watcher = null;
        this.refresh = () => {
            this.setState({
                id: this.state.id + 1
            });
        };
        this.state = {
            id: 0
        };
    }
    shouldComponentUpdate(nextProps, nextState) {
        return Object.keys(nextProps).reduce((p, k) => {
            return p || (k !== 'render' && this.props[k] !== nextProps[k]);
        }, false) || this.state.id !== nextState.id;
    }
    componentWillUnmount() {
        this.watcher && this.watcher.destroy();
    }
    watch(fn) {
        return this.watcher.watch(fn, this.refresh).value;
    }
    render() {
        return React.createElement(WatcherContext.Consumer, {}, React.createElement((parent) => {
            parent = parent || Watcher.ROOT;
            this.watcher = this.watcher || parent.create();
            this.watcher.clear();
            return React.createElement(WatcherContext.Provider, {
                "value": this.watcher
            }, [this.props.render(this.watch.bind(this))]);
        }));
    }
}
export function useWatcher() {
    const parent = useContext(WatcherContext);
    const [change, onChange] = useState({});
    let [watcher] = useState(() => parent.create());
    watcher.clear();
    useEffect(() => {
        return () => {
            watcher.destroy();
        };
    }, [watcher]);
    return {
        watch: (fn) => {
            return watcher.watch(fn, () => onChange({})).value;
        }
    };
}
;

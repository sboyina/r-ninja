import { createElement } from "react";
import { ViewmodelContext } from "./hooks";
import { check } from "./ninja";

export abstract class ViewModel<P> {
    private cleanUp: Function[] = [];
    private cachedComponent: React.ReactNode;
    public props: P = {} as P;
    
    constructor(public Component: React.ComponentType<any>) {
    }

    check() {
        check();
    }
    
    onInit() {
        // to be implemented by subclasses
    }

    onDestroyCall(fn: Function) {
        this.cleanUp.push(fn);
    }

    onDestroy() {
        this.cleanUp.forEach(fn => {
            try {
                fn && fn();
            } catch (e) {
                console.error(e);
            }
        });
    }

    render() {
        this.cachedComponent = this.cachedComponent || createElement(
            ViewmodelContext.Provider, {
                value: this
            }, [
                createElement(this.Component)
            ]
        );
        return this.cachedComponent;
    }
}
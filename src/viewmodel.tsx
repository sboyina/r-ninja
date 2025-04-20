import { useEffect, useState } from "react";
import { internals } from "./components/internals";

export abstract class ViewModel {
    private cleanUp: Function[] = [];

    constructor() {
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
}

export function useViewModel<T extends ViewModel>(fn: () => T) {
    const [model] = useState(fn);
    useEffect(() => {
        internals.models.push(model);
        model.onInit();
        return () => {
            const i = internals.models.indexOf(model);
            if (i >= 0) {
                internals.models.splice(i, 1);
            }
            model.onDestroy();
        };
    }, [model]);
    return model;
};
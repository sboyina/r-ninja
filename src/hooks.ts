import { ViewModel } from "./viewmodel";
import { createContext, createElement, useContext, useEffect, useState } from "react";

export const createViewmodelContext = <T extends ViewModel<any>>() => createContext<T>(null as any);

export const ViewmodelContext = createViewmodelContext();

export const ViewmodelProvider = (value: ViewModel<any>, children: React.ReactNode) => {
    const [viewmodel] = useState(value);
    useEffect(() => {
        viewmodel.onInit();
        viewmodel.check();
        return () => {
            viewmodel.onDestroy();
            viewmodel.check();
        };
    }, [viewmodel]);
    return createElement(ViewmodelContext.Provider, {
        value: viewmodel
    }, children);
};

export const useViewModel = <T>(): T => {
    return useContext(ViewmodelContext) as any as T;
};
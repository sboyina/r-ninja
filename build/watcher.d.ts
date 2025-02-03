declare class WatchExpression {
    private fn;
    private onChange;
    private last;
    private expBody;
    lastExecutionTime: number;
    constructor(fn: Function, onChange: (prev: any, now: any) => any);
    private getExpBody;
    private execute;
    private isEqual;
    get value(): any;
    check(): boolean;
}
export declare class Watcher {
    static ROOT: Watcher;
    expressions: WatchExpression[];
    isActive: boolean;
    parent: Watcher;
    children: Watcher[];
    private constructor();
    check(): void;
    create(): Watcher;
    remove(child: Watcher): void;
    destroy(): void;
    clear(): void;
    watch(fn: Function, onChange: (prev: any, now: any) => any): WatchExpression;
    count(): number;
}
export {};

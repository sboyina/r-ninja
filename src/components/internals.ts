import { Watcher, WatchExpression } from "../watcher";
import { ViewModel } from "../viewmodel";

export const internals = {
    ROOT: Watcher.ROOT,
    models: [] as ViewModel[],
    expressions: (watcher = Watcher.ROOT): WatchExpression[] => {
        if (!watcher.isActive) {
            return [];
        }
        return [
            ...(watcher.expressions||[]), 
            ...(watcher.children?.map(w => internals.expressions(w)).flat() || [])
        ];
    },
    getExpression: (expression: string) => {
        expression = expression.toLowerCase();
        return internals.expressions().filter(w => {
            const expr = w.fn.toString().substring(6);
            if (expr.toLowerCase().indexOf(expression) >= 0) {
                return w;
            }
        }).map((w) => {
            return {
                expression: w.fn,
                value: w.last
            };
        });
    }
};
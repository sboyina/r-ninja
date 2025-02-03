class WatchExpression {
    constructor(fn, onChange) {
        this.fn = fn;
        this.onChange = onChange;
        this.last = null;
        this.expBody = null;
        this.lastExecutionTime = 0;
        this.last = this.execute();
        if (Array.isArray(this.last)) {
            this.last = [...this.last];
        }
    }
    getExpBody() {
        if (!this.expBody) {
            const expStr = this.fn.toString();
            this.expBody = expStr.substring(expStr.indexOf('return ') + 7, expStr.lastIndexOf(';'));
        }
        return this.expBody;
    }
    execute() {
        try {
            return this.fn();
        }
        catch (e) {
            //do nothing
            return null;
        }
    }
    isEqual($old, $new) {
        const isArrayObj = Array.isArray($old) || Array.isArray($new);
        if (isArrayObj) {
            if (($old && !$new)
                || (!$old && $new)
                || $old.length !== $new.length) {
                return false;
            }
            for (let i = 0; i < $old.length; i++) {
                if ($old[i] !== $new[i]) {
                    return false;
                }
            }
            return true;
        }
        return $old === $new;
    }
    get value() {
        return this.last;
    }
    check() {
        const start = Date.now();
        const now = this.execute();
        const changed = !this.isEqual(this.last, now);
        this.lastExecutionTime = Date.now() - start;
        if (changed) {
            this.onChange(this.last, now);
            this.last = now;
            if (Array.isArray(this.last)) {
                this.last = [...this.last];
            }
            return true;
        }
        return false;
    }
}
export class Watcher {
    constructor() {
        this.expressions = [];
        this.isActive = true;
        this.parent = null;
        this.children = [];
    }
    check() {
        if (this.isActive) {
            this.expressions.forEach(expression => expression.check());
            this.children.forEach(child => {
                child.check();
            });
        }
    }
    create() {
        const child = new Watcher();
        child.parent = this;
        this.children.push(child);
        return child;
    }
    remove(child) {
        if (this.children.length > 0) {
            const i = this.children.indexOf(child);
            if (i >= 0) {
                this.children.splice(i, 1);
            }
        }
    }
    destroy() {
        this.clear();
        this.parent && this.parent.remove(this);
    }
    clear() {
        this.children = [];
        this.expressions = [];
    }
    watch(fn, onChange) {
        const expression = new WatchExpression(fn, onChange);
        this.expressions.push(expression);
        return expression;
    }
    count() {
        if (!this.isActive) {
            return 0;
        }
        let count = this.expressions.length;
        this.children.forEach(child => {
            count += child.count();
        });
        return count;
    }
}
Watcher.ROOT = new Watcher();

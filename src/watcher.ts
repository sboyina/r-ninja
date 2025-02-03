class WatchExpression {
    private last: any = null;
    private expBody: string = null as any;
    public lastExecutionTime = 0;

    constructor(private fn: Function, private onChange: (prev: any, now: any) => any) {
        this.last = this.execute();
        if (Array.isArray(this.last)) {
            this.last = [...this.last];
        }
    }

    private getExpBody() {
        if (!this.expBody) {
            const expStr = this.fn.toString();
            this.expBody = expStr.substring(
                expStr.indexOf('return ') + 7,
                expStr.lastIndexOf(';'));
        }
        return this.expBody;
    }
    
    private execute() {
        try {
            return this.fn();
        } catch(e) {
            //do nothing
            return null;
        }
    }

    private isEqual($old: any, $new: any) {
        const isArrayObj = Array.isArray($old) || Array.isArray($new);
        if (isArrayObj) {
            if (($old && !$new) 
                || (!$old && $new)
                || $old.length !== $new.length) {
                return false;
            }
            for(let i = 0; i < $old.length; i++) {
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

    public check() {
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
    public static ROOT = new Watcher();
    public expressions = [] as WatchExpression[];
    public isActive = true;
    public parent: Watcher = null as any;
    public children = [] as Watcher[];
    private constructor() {}

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

    remove(child: Watcher) {
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

    watch(fn: Function, onChange: (prev: any, now: any) => any) {
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
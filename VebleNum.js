let O = VebleNum = function(input) { return new Ordinal(input) };

class Ordinal {
    constructor(input) {
        if (input == undefined) this.value = 0;
        else if (typeof input == 'number') this.value = input;
        else if (typeof input == 'string') this.value = Ordinal.fromString(input);
        else if (input instanceof Array) this.value = [...input];
        else if (input.value !== undefined) this.value = new Ordinal(input.value).value;
        else this.value = 0;

        this.normalize();
    }

    get isLim() {
        if (!(this.value instanceof Array)) return this.value == 0;
        return new Ordinal(this.value[0]).isLim;
    }

    get isSucc() {
        return !this.isLim;
    }

    get isFinite() {
        return typeof this.value == 'number';
    }
    
    get isTransfinite() {
        return typeof this.value != 'number';
    }

    get isGamma() { // Additively indecomposable
        if (this.isFinite) {
            if (this.value == 1) return true;
            return false;
        }
        if (this.value.length < 2) return false;
        return this.value[0] === 0;
    }

    get isDelta() { // Multiplicatively indecomposable
        if (this.isFinite) {
            if (this.value == 2) return true;
            return false;
        }
        if (this.value.length < 2) return false;
        return new Ordinal(this.value[1]).isGamma;
    }

    get isEpsilon() { // Exponentially indecomposable
        if (this.isFinite) return false;
        if (this.value.length < 3) return false;
        return !(this.value[0] !== 0 || this.value[1] !== 0);
    }

    fundSequence(el) {
        if (this.isSucc || this.value === 0) return undefined;
        if (this.value[0] !== 0) {
            let x = new Ordinal(this.value[0]).fundSequence(el);
            let y = [...this.value];
            y[0] = x.value;
            return new Ordinal(y);
        }
        if (this.value.length == 1 && this.value[0] == 0) return new Ordinal(el);
        let o = new Ordinal(this);
        let x;
        for (let i in this.value) {
            x = i;
            if (this.value[i] !== 0) break;
        }
        let n = new Ordinal(this.value[x]);
        if (n.isSucc) {
            let y = x - 1;
            if (typeof o.value[x] == 'number') {
                o.value[x]--
            } else {
                o.value[x][0]--;
            }
            for (let i = 0; i < el; i++) {
                let a = [...o.value];
                o.value[y] = a;
            }
            o.normalize();
            return o;
        }
        let w = new Ordinal(this.value[x]).fundSequence(el);
        let v = [...this.value];
        v[x] = w.value;
        return new Ordinal(v);
    }

    cmp(other) {
        this.normalize();
        other = new Ordinal(other);
        if (this.value instanceof Array && !(other.value instanceof Array)) return 1;
        if (other.value instanceof Array && !(this.value instanceof Array)) return -1;
        if (!(this.value instanceof Array) && !(other.value instanceof Array)) return (this.value == other.value ? 0 : (this.value > other.value ? 1 : -1));
        if (this.value.length > other.value.length) return 1;
        if (this.value.length < other.value.length) return -1;
        for (let i = this.value.length - 1; i >= 0; i--) {
            let x = new Ordinal(this.value[i]);
            let z = x.cmp(other.value[i]);
            if (z != 0) return z;
        }
        return 0;
    }

    eq(other) { return this.cmp(other) === 0; }
    neq(other) { return this.cmp(other) !== 0; }
    gt(other) { return this.cmp(other) > 0; }
    gte(other) { return this.cmp(other) > -1; }
    lt(other) { return this.cmp(other) < 0; }
    gt(other) { return this.cmp(other) > 0; }

    cmpLims(other) { // For addition
        this.normalize();
        other = new Ordinal(other);
        if (this.value instanceof Array && !(other.value instanceof Array)) return 1;
        if (other.value instanceof Array && !(this.value instanceof Array)) return -1;
        if (!(this.value instanceof Array) && !(other.value instanceof Array)) return 0;
        if (this.value.length > other.value.length) return 1;
        if (this.value.length < other.value.length) return -1;
        for (let i = this.value.length - 1; i >= 1; i--) {
            let x = new Ordinal(this.value[i]).cmp(other.value[i]);
            if (x != 0) return x;
        }
        return 0;
    }

    cmpLims2(other) { // For multiplication
        this.normalize();
        other = new Ordinal(other);
        if (this.value instanceof Array && !(other.value instanceof Array)) return 1;
        if (other.value instanceof Array && !(this.value instanceof Array)) return -1;
        if (!(this.value instanceof Array) && !(other.value instanceof Array)) return 0;
        if (this.value.length < 3 && other.value.length < 3) return 0;
        if (this.value.length >= 2 && this.value.length > other.value.length) return 1;
        if (other.value.length >= 2 && this.value.length < other.value.length) return -1;
        for (let i = this.value.length - 1; i >= 2; i--) {
            let x = new Ordinal(this.value[i]).cmp(other.value[i]);
            if (x != 0) return x;
        }
        return 0;
    }

    condense(other) { // For addition
        let x = new Ordinal(this);
        other = new Ordinal(other);
        if (x.cmpLims(other) == -1) {
            x = new Ordinal(0);
        } else if (typeof x.value == 'number') {
            return x;
        } else {
            x.value[0] = new Ordinal(x.value[0]).condense(other).value;
        }
        return x;
    }

    condense2(other,first = true) { // For multiplication
        let x = new Ordinal(this);
        other = new Ordinal(other);
        if (first && x.cmpLims2(other) < 0 || !first && x.cmpLims2(other) < 1) {
            x = new Ordinal(0);
        } else if (typeof x.value == 'number') {
            return x;
        } else {
            x.value[0] = new Ordinal(x.value[0]).condense2(other, false).value;
        }
        return x;
    }

    add(other) {
        let x = new Ordinal(this);
        other = new Ordinal(other);
        let c = x.cmpLims(other);
        if (c == -1) return other;
        if (!(x.value instanceof Array) && !(other.value instanceof Array)) return new Ordinal(x.value + other.value);
        if (x.eq(0)) return other;
        if (other.eq(0)) return x;
        let o = x.condense(other);
        o.value[0] = new Ordinal(o.value[0]).add(other).value;
        if (getArrayDepth(o.value) > 10) return new Ordinal(NaN);
        return o;
    }

    mul(other) {
        let x = new Ordinal(this);
        other = new Ordinal(other);
        if (!(x.value instanceof Array) && !(other.value instanceof Array)) return new Ordinal(x.value * other.value);
        if (x.eq(0) || other.eq(0)) return 0;
        if (x.eq(1)) return other;
        if (other.eq(1)) return x;
        if (this.isFinite && other.isSucc) {
            let y = new Ordinal(other.value[0]);
            let z = new Ordinal(other);
            z.value[0] = 0;
            return this.mul(z).add(this.mul(y));
        }
        let c = x.cmpLims2(other);
        if (c == -1) return other;
        if (other.value instanceof Array) {
            if (other.value[0] !== 0) {
                let y = new Ordinal(0);
                let z = new Ordinal(other);
                z.value[0] = 0;
                y = y.add(x.mul(z));
                y = y.add(x.mul(other.value[0]));
                return y;
            }
            if (x.value.length < 2) x.value[1] = 0;
            if (other.value.length < 2) other.value[1] = 0;
            else if (other.value.length > 2) {
                x.value[1] = new Ordinal(x.value[1]).add(other).value;
                return x;
            }
            other.value[1] = new Ordinal(1).add(other.value[1]).value;
            new Ordinal(x.value[0]).add(other.value[0]).value;
            x = x.condense2(other);
            x.value[1] = new Ordinal(x.value[1]).add(other.value[1]).value;
            return x;
        } else {
            if (other.value > 10) return new Ordinal(NaN);
            let y = new Ordinal(0);
            for (let i = 0; i < other.value; i++) {
                y = y.add(this);
            }
            return y;
        }
    }

    pow(other) {
        let x = new Ordinal(this);
        other = new Ordinal(other);
        if (this.isFinite && other.isFinite) return new Ordinal(x.value ** other.value);
        if (other.eq(0)) return new Ordinal(1);
        if (other.eq(1)) return x;
        if (x.eq(1)) return new Ordinal(1);
        if (x.eq(0) && other.neq(0)) return new Ordinal(0);
        if (x.eq(0)) return new Ordinal(NaN);
        if (this.isFinite && other.value[0] === 0) return other;

        if (other.isFinite && this.isLim) {
            if (other.value > 10) return new Ordinal(NaN);
            let y = new Ordinal(1);
            for (let i = 0; i < other.value; i++) {
                y = y.mul(x);
            }
            return y;
        }
        if (other.isTransfinite && other.value[0] !== 0) {
            let y = new Ordinal(other);
            y.value[0] = 0;
            return this.pow(y).mul(this.pow(other.value[0]));
        }
        if (x.value.length < 2) x.value[1] = 0;
        if (other.isEpsilon) {
            if (x.isEpsilon) {
                // TODO
            }
            x.value[1] = new Ordinal(1).add(x.value[1]).mul(other).value;
            return x;
        }
        // if (other.isGamma) is not necessary as that is the only case
        x.value[1] = new Ordinal(1).add(x.value[1]).mul(other.value[1]).value;
        return x;
        
        return x;
    }

    normalize() {
        if (this.value instanceof Array) {
            if (this.value.length == 0) this.value = 0;
            else {
                if (getArrayDepth(this.value) > 10) return new Ordinal(NaN);
                while (this.value.length > 1 && this.value[this.value.length - 1] === 0) {
                    this.value.pop();
                }
                for (let i of this.value) {
                    if (i instanceof Array) {
                        let o = new Ordinal(i);
                        o.normalize();
                        i = o.value;
                    }
                }
            }
        }
    }

    toString() {
        this.normalize();
        if (this.value instanceof Array) {
            if (this.value.length < 2) {
                let x = getArrayDepth(this.value);
                let y = getValueAtDepth(this.value,x);
                return "w" + (x == 1 ? "" : x) + (y == 0 ? "" : "+" + y);
            }
            if (this.value.length < 3) {
                let x = new Ordinal(1).add(this.value[1]).toString();
                let strBase = "w^" + (x.length > 1 && (!(x.startsWith("w^")) || x.search(/\+/) > -1 || x.search(/\*/) > -1) ? (`(${x})`) : x);
                let strAdd = new Ordinal(this.value[0]).toString();
                let bm = 1;
                while (strAdd.startsWith(strBase)) {
                    strAdd = strAdd.substring(strBase.length);
                    if (/\d/.test(strAdd.charAt(0))) {
                        let z = parseFloat(strAdd.match(/\d+/)[0]);
                        bm += z - 1;
                        strAdd = strAdd.substring(("" + z).length);
                    }
                    while (strAdd.charAt(0) == '+') {
                        strAdd = strAdd.substring(1);
                    }
                    bm++
                }
                return strBase + (bm != 1 && bm != 0 ? /* '*' +  */bm : '') + ((strAdd != '0' && strAdd != '') ? '+' + strAdd : '');
            }
        }
        return this.value.toString();
    }
}

Ordinal.fromString = function (str) {
    let fl = parseFloat(str);
    if (!isNaN(fl)) return fl;
    if (str.search(/[^w\d\+\*\^\(\)]/) > -1) return 'Too large';
    try {
        let a = str.split('(').map(e => e.split(')')).flat();
        a = a.map(e => e.split('+'));
        return a;
    } catch (e) {
        console.warn('Make sure strings are in Extended Cantor Normal Form');
    }
}

function getArrayDepth(value) {
    return Array.isArray(value) ? 
      1 + Math.max(...value.map(getArrayDepth)) :
      0;
}

function getValueAtDepth(array,depth) {
    let x = array;
    for (let i = 0; i < depth; i++) {
        x = x[0];
    }
    return x;
}
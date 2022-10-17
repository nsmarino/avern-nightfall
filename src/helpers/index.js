function removeArrayElement(array, element) {
    const ndx = array.indexOf(element);
    if (ndx >= 0) {
      array.splice(ndx, 1);
    }
  }

function getSine(tick, amplitude, offset=0) {
    var x = 1;
    var y = 0;
    var frequency = 0.25
    var height = 1
    var x = 1;
    var y = 0;

    y = height/2 + amplitude * Math.sin((x+tick)/frequency);
    x++;

    return y + offset
}

class SafeArray {
    constructor() {
        this.array = [];
        this.addQueue = [];
        this.removeQueue = new Set();
    }
    get isEmpty() {
        return this.addQueue.length + this.array.length > 0;
    }
    add(element) {
        this.addQueue.push(element);
    }
    remove(element) {
        this.removeQueue.add(element);
    }
    findByName(name) {
        this._addQueued();
        this._removeQueued();
        return this.array.find(element=>element.name===name);
    }
    forEach(fn) {
        this._addQueued();
        this._removeQueued();
        for (const element of this.array) {
        if (this.removeQueue.has(element)) {
            continue;
        }
        fn(element);
        }
        this._removeQueued();
    }
    _addQueued() {
        if (this.addQueue.length) {
        this.array.splice(this.array.length, 0, ...this.addQueue);
        this.addQueue = [];
        }
    }
    _removeQueued() {
        if (this.removeQueue.size) {
        this.array = this.array.filter(element => !this.removeQueue.has(element));
        this.removeQueue.clear();
        }
    }
}

export { removeArrayElement, getSine, SafeArray }
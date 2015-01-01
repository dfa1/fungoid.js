// Objectives:
// - no intermediate array allocations, unlike other libraries
// - automatic currying: map with one argument yields a detached iterator
// - target is ES5
// - forward compatibility with ES6 iterators
// - no library dependencies

// XXX: this approach suffers a major performance penalty
//      we must allocate **many** iterator results
class IteratorResult {

	static value(value) {
		return { done: false, value: value};
	}

	static done() {
		return { done: true };
	}
}

class ArrayIterator {

	constructor(ary) {
		this.ary = ary;
		this.i = 0;
	}

	next() {
		if (this.i < this.ary.length) {
			let element = this.ary[this.i];
			this.i += 1;
			return IteratorResult.value(element);
		} else {
			return IteratorResult.done();
		}
	}
}

// yields numbers in range [start, stop)
// TODO: step
class RangeIterator {

	constructor(start, stop) {
		this.i = start;
		this.stop = stop;
	}

	next() {
		if (this.i < this.stop) {
			let value = this.i;
			this.i += 1;
			return IteratorResult.value(value);
		} else {
			return IteratorResult.done();
		}
	}
}

// yields value indefinitely
class RepeatIterator {

	constructor(value) {
		this.value = value;
	}

	next() {
		return IteratorResult.value(this.value);
	}
}

// yields [k, object[k]]
class ObjectIterator {

	constructor(object) {
		this.object = object;
		this.keys = Object.keys(object);
		this.i = 0;
	}

	next() {
		if (this.i < this.keys.length) {
			let k = this.keys[this.i];
			let v = this.object[k];
			this.i += 1;
			return IteratorResult.value([k, v]);
		} else {
			return IteratorResult.done();
		}
	}
}

// yields fn(value) for each value
class MapIterator {

	constructor(fn, upstream) {
		this.fn = fn;
		this.upstream = upstream;
	}

	next() {
		let it = this.upstream.next();
		if (it.done) {
			return it;
		}
		let mappedValue = this.fn(it.value);
		return IteratorResult.value(mappedValue);
	}
}

// discards value where fn(value) === false
class FilterIterator {

	constructor(fn, upstream) {
		this.fn = fn;
		this.upstream = upstream;
	}

	next() {
		for (;;) {
			let it = this.upstream.next();
			if (it.done) {
				return it;
			}
			let accepted = this.fn(it.value) === true;
			if (accepted) {
				return it;
			}
		}
	}
}

class TakeIterator {

	constructor(n, upstream) {
		if (n < 0) {
			throw new Error("n cannot be negative");
		}
		this.n = n;
		this.upstream = upstream;
	}

	next() {
		if (this.n === 0) {
			return IteratorResult.done();
		}
		this.n -= 1;
		return this.upstream.next();
	}
}

class DropIterator {

	constructor(n, upstream) {
		if (n < 0) {
			throw new Error("n cannot be negative");
		}
		this.n = n;
		this.upstream = upstream;
	}

	next() {
		while (this.n > 0) {
			let ignored = this.upstream.next();
			this.n -= 1;
		}
		return this.upstream.next();
	}
}

// call fn for each value, presumably for side-effect
class TapIterator {

	constructor(fn, upstream) {
		this.fn = fn;
		this.upstream = upstream;
	}

	next() {
		let it = this.upstream.next();
		if (it.done) {
			return it;
		}
		this.fn(it.value);
		return it;
	}

}

// juxt(f,g,h) -> [f(x),g(x),h(x)]
// TODO: upstream + rewrite using map
class JuxtIterator {

	constructor() {
        this.fns = Array.prototype.slice.call(arguments);
	}

	next() {
		let it = this.upstream.next();
		if (it.done) {
			return it;
		}
		let value = it.value;
        let newValues = [];
		for (let i = 0; i < this.fns.length; i += 1) {
			let fn = this.fns[i];
			let newValue = fn(e);
			newValues.push(newValue);
		}
		return IteratorResult.value(newValues);
	}
}

class ArrayReducer {

	init() {
		return [];
	}

	step(acc, value) {
		acc.push(value);
		return acc;
	}

}

class ObjectReducer {

	init() {
		return {};
	}

	step(acc, value) {
		let k = value[0];
		let v = value[1];
		acc[k] = v;
		return acc;
	}

}

class GroupByReducer {

	constructor(fn) {
		this.fn = fn;
	}

	init() {
		return {};
	}

	step(acc, value) {
		let key = this.fn(value);
		if (!acc[key]) {
			acc[key]= [];
		}
		acc[key].push(value);
		return acc;
	}

}

class MaxReducer {

	init() {
		return -Infinity;
	}

	step(acc, value) {
		return Math.max(acc, value);
	}

}

class MinReducer {

	init() {
		return +Infinity;
	}

	step(acc, value) {
		return Math.min(acc, value);
	}

}

class SumReducer {

	init() {
		return 0;
	}

	step(acc, value) {
		return acc + value;
	}
}

// reducer:
//   init()           -> acc
//   step(acc, value) -> acc
// TODO: result(acc)      -> acc
function reduce(iterator, reducer) {
	let acc = reducer.init();
	for (;;) {
		let it = iterator.next();
		if (it.done) {
			return acc;
		}
		acc = reducer.step(acc, it.value);
	}
}

class Pipeline {

	constructor(upstream) {
		this.upstream = upstream;
	}

	static of(iterator) {
		return new Pipeline(iterator);
	}
	static ofArray(ary) {
		return new Pipeline(new ArrayIterator(ary));
	}

	static ofObject(object) {
		return new Pipeline(new ObjectIterator(object));
	}

	static ofRange(start, stop) {
		return new Pipeline(new RangeIterator(start, stop));
	}

	map(fn) {
	   	this.upstream = new MapIterator(fn, this.upstream);
		return this;
	}

	filter(fn) {
	   	this.upstream = new FilterIterator(fn, this.upstream);
		return this;
	}

	take(n) {
	   	this.upstream = new TakeIterator(n, this.upstream);
		return this;
	}

	drop(n) {
	   	this.upstream = new DropIterator(n, this.upstream);
		return this;
	}

	tap(fn) {
		this.upstream = new TapIterator(fn, this.upstream);
		return this;
	}

	reduce(reducer) {
		return reduce(this.upstream, reducer);
	}

	min() {
		return reduce(this.upstream, new MinReducer());
	}

	max() {
		return reduce(this.upstream, new MaxReducer());
	}

	sum() {
		return reduce(this.upstream, new SumReducer());
	}

	toArray() {
		return reduce(this.upstream, new ArrayReducer());
	}

	toObject() {
		return reduce(this.upstream, new ObjectReducer());
	}

	toGroups(fn) {
		return reduce(this.upstream, new GroupByReducer(fn));
	}
}

// workaround for browser
var exports = {};
export {
	ArrayIterator,
	ObjectIterator,
	RangeIterator,
	RepeatIterator,

	MapIterator,
	FilterIterator,
	TakeIterator,
	DropIterator,
	TapIterator,

	Pipeline,
}

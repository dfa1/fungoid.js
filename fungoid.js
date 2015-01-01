// Objectives:
// - inspired by Clojure transducers
// - fluent interface
// - no type dispatching: user explicitly specify both source and target of transformations
// - no intermediate array allocations
// - no library dependencies
// - target is ES5
// - forward compatibility with ES6 iterators

// yields fn(value) for each value
class MapTransformer {

	constructor(fn, downstream) {
		this.fn = fn;
		this.downstream = downstream;
	}

	init() {
		return this.downstream.init();
	}

	result(acc) {
		return this.downstream.result(acc);
	}

	step(acc, value) {
		return this.downstream.step(acc, this.fn(value));
	}
}

// discards value when fn(value) yields false
class FilterTransformer {

	constructor(fn, downstream) {
		this.fn = fn;
		this.downstream = downstream;
	}

	init() {
		return this.downstream.init();
	}

	result(acc) {
		return this.downstream.result(acc);
	}

	step(acc, value) {
		if (this.fn(value)) {
			return this.downstream.step(acc, value);
		} else {
			return acc;
		}
	}
}

class Reduced {

	constructor(result) {
		this.result = result;
	}

	unwrap() {
		return this.result;
	}
}

class TakeTransformer {

	constructor(n, downstream) {
		this.n = n;
		this.downstream = downstream;
	}

	init() {
		return this.downstream.init();
	}

	result(acc) {
		// TODO: double check, other impls unwraps right after step()
		if (acc instanceof Reduced) {
			acc = acc.unwrap();
		}
		return this.downstream.result(acc);
	}

	step(acc, value) {
		if (this.n > 0) {
			this.n -= 1;
			return this.downstream.step(acc, value);
		} else {
			return new Reduced(acc);
		}
	}
}

class DropTransformer {

	constructor(n, downstream) {
		this.n = n;
		this.downstream = downstream;
	}

	init() {
		return this.downstream.init();
	}

	result(acc) {
		return this.downstream.result(acc);
	}

	step(acc, value) {
		if (this.n > 0) {
			this.n -= 1;
			return acc;
		} else {
			return this.downstream.step(acc, value);
		}
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

	result(acc) {
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

	result(acc) {
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

 	result(acc) {
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
 	result(acc) {
		return acc;
	}

}

class MinReducer {

	init() {
		return +Infinity;
	}

	step(acc, value) {
		return Math.min(acc, value);
	}
 	result(acc) {
		return acc;
	}

}

class SumReducer {

	init() {
		return 0;
	}

	step(acc, value) {
		return acc + value;
	}

	result(acc) {
		return acc;
	}

}

function rangeSource(start, end) {
	return function(transformer) {
		let acc = transformer.init();
		for (let i = start; i < end; i += 1) {
			acc = transformer.step(acc, i);
			if (acc instanceof Reduced) {
				break;
			}
		}
		return transformer.result(acc);
	};
}

function arraySource(array) {
	return function(transformer) {
		let acc = transformer.init();
		for (let i = 0; i < array.length; i += 1) {
			acc = transformer.step(acc, array[i]);
			if (acc instanceof Reduced) {
				break;
			}
		}
		return transformer.result(acc);
	};
}

// we don't want dispatch by type: let the client call the right function
// (open/closed principle)
class Transducer {

	constructor(source) {
		this.source = source;
		this.transformers = [];
	}

	// [start, end)
	static fromRange(start, end) {
		return new Transducer(rangeSource(start, end));
	}

	static fromArray(array) {
		return new Transducer(arraySource(array));
	}

	map(fn) {
		this.transformers.unshift(new MapTransformer(fn));
		return this;
	}

	filter(fn) {
		this.transformers.unshift(new FilterTransformer(fn));
		return this;
	}

	take(n) {
		this.transformers.unshift(new TakeTransformer(n));
		return this;
	}

	drop(n) {
		this.transformers.unshift(new DropTransformer(n));
		return this;
	}

	// reductions

	// allows manual inspecting of the final transformer
	build(reducer) {
		let transformer = reducer;
		for (let i = 0; i < this.transformers.length; i += 1) {
			this.transformers[i].downstream = transformer;
			transformer = this.transformers[i];
		}
		return transformer;
	}

	// TODO: reducer is a shitty name
	transduce(reducer) {
		let transformer = this.build(reducer);
		return this.source(transformer);
	}

	toArray() {
		return this.transduce(new ArrayReducer());
	}

	min() {
		return this.transduce(new MinReducer());
	}

	max() {
		return this.transduce(new MaxReducer());
	}

	sum() {
		return this.transduce(new SumReducer());
	}
}

// workaround for browser
var exports = {};
export {
	Transducer
}

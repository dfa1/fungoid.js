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

	result(result) {
		return this.downstream.result(result);
	}

	step(result, value) {
		return this.downstream.step(result, this.fn(value));
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

	result(result) {
		return this.downstream.result(result);
	}

	step(result, value) {
		if (this.fn(value)) {
			return this.downstream.step(result, value);
		} else {
			return result;
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

	result(result) {
		// TODO: double check, other impls unwraps right after step()
		if (result instanceof Reduced) {
			result = result.unwrap();
		}
		return this.downstream.result(result);
	}

	step(result, value) {
		if (this.n > 0) {
			this.n -= 1;
			return this.downstream.step(result, value);
		} else {
			return new Reduced(result);
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

	result(result) {
		return this.downstream.result(result);
	}

	step(result, value) {
		if (this.n > 0) {
			this.n -= 1;
			return result;
		} else {
			return this.downstream.step(result, value);
		}
	}
}


class ArrayReducer {

	init() {
		return [];
	}

	step(result, value) {
		result.push(value);
		return result;
	}

	result(result) {
		return result;
	}
}

class ObjectReducer {

	init() {
		return {};
	}

	step(result, value) {
		let k = value[0];
		let v = value[1];
		result[k] = v;
		return result;
	}

	result(result) {
		return result;
	}
}

class GroupByReducer {

	constructor(fn) {
		this.fn = fn;
	}

	init() {
		return {};
	}

	step(result, value) {
		let key = this.fn(value);
		if (!result[key]) {
			result[key]= [];
		}
		result[key].push(value);
		return result;
	}

 	result(result) {
		return result;
	}
}

class MaxReducer {

	init() {
		return -Infinity;
	}

	step(result, value) {
		return Math.max(result, value);
	}
 	result(result) {
		return result;
	}

}

class MinReducer {

	init() {
		return +Infinity;
	}

	step(result, value) {
		return Math.min(result, value);
	}
 	result(result) {
		return result;
	}

}

class SumReducer {

	init() {
		return 0;
	}

	step(result, value) {
		return result + value;
	}

	result(result) {
		return result;
	}

}

function rangeSource(start, end) {
	return function(transformer) {
		let result = transformer.init();
		for (let i = start; i < end; i += 1) {
			result = transformer.step(result, i);
			if (result instanceof Reduced) {
				break;
			}
		}
		return transformer.result(result);
	};
}

function arraySource(array) {
	return function(transformer) {
		let result = transformer.init();
		for (let i = 0; i < array.length; i += 1) {
			result = transformer.step(result, array[i]);
			if (result instanceof Reduced) {
				break;
			}
		}
		return transformer.result(result);
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

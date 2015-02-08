// Objectives:
// - inspired by Clojure transducers + experimental fluent interface
// - no type dispatching: user explicitly specify both source and target of transformations
// - no intermediate allocations
// - no library dependencies
// - target is ES5
// - forward compatibility with ES6 iterators

// needed to signal that the transformation has been terminated
class Reduced {

	constructor(result) {
		this.result = result;
	}

	unwrap() {
		return this.result;
	}
}

// yields fn(value) for each value
class MapTransformer {

	constructor(fn, downstream) {
		this.fn = fn;
		this.downstream = downstream;
	}

	init() {
		return this.downstream.init();
	}

	step(result, value) {
		return this.downstream.step(result, this.fn(value));
	}

	result(result) {
		return this.downstream.result(result);
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

	step(result, value) {
		if (this.fn(value)) {
			return this.downstream.step(result, value);
		} else {
			return result;
		}
	}

	result(result) {
		return this.downstream.result(result);
	}
}

// takes 'n' items, then discards all
class TakeTransformer {

	constructor(n, downstream) {
		this.n = n;
		this.downstream = downstream;
	}

	init() {
		return this.downstream.init();
	}

	step(result, value) {
		if (this.n > 0) {
			this.n -= 1;
			return this.downstream.step(result, value);
		} else {
			return new Reduced(result);
		}
	}

	result(result) {
		// double check this: other impls unwraps right after step()
		if (result instanceof Reduced) {
			result = result.unwrap();
		}
		return this.downstream.result(result);
	}
}


// drops 'n' items, then takes everything
class DropTransformer {

	constructor(n, downstream) {
		this.n = n;
		this.downstream = downstream;
	}

	init() {
		return this.downstream.init();
	}

	step(result, value) {
		if (this.n > 0) {
			this.n -= 1;
			return result;
		} else {
			return this.downstream.step(result, value);
		}
	}

	result(result) {
		return this.downstream.result(result);
	}
}

// recursively flatten arrays
class FlattenTransformer {

	constructor(downstream) {
		this.downstream = downstream;
	}

	init() {
		return this.downstream.init();
	}

	step(result, value) {
		if (Array.isArray(value)) {
			let array = value;
			for (let i = 0; i < array.length; i += 1) {
				result = this.step(result, array[i]);
			}
			return result;
		}
		return this.downstream.step(result, value);
	}

	result(result) {
		return this.downstream.result(result);
	}
}

// juxt(cos, sin)(x) = [cos(x), sin(x)]
class JuxtTransformer {

	constructor(fns, downstream) {
		this.fns = fns;
		this.downstream = downstream;
	}

	init() {
		return this.downstream.init();
	}

	step(result, value) {
		let values = [];
		for (let i = 0; i < this.fns.length; i += 1) {
			let fn = this.fns[i];
			values.push(fn(value));
		}
		return this.downstream.step(result, values);
	}

	result(result) {
		return this.downstream.result(result);
	}
}

// namedJuxt({c:cos, s:sin})(x) = {c: cos(x), s: sin(x)}
class NamedJuxtTransformer {

	constructor(fns, downstream) {
		this.fns = fns;
		this.downstream = downstream;
	}

	init() {
		return this.downstream.init();
	}

	step(result, value) {
		let values = {};
		for (let k in this.fns) {
			if (this.fns.hasOwnProperty(k)) {
				let fn = this.fns[k];
				values[k] = fn(value);
			}
		}
		return this.downstream.step(result, values);
	}

	result(result) {
		return this.downstream.result(result);
	}
}

// final step of transformation: reducers

class ValueReducer {

	init() {
		return undefined;
	}

	step(result, value) {
		return value;
	}

	result(result) {
		return result;
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
		// XXX: perfect use case of ES6 Map
		let key = this.fn(value);
		if (!result[key]) {
			result[key] = [];
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

class Pipeline {

	constructor(source) {
		this.source = source;
		this.transformers = [];
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

	flatten() {
		this.transformers.unshift(new FlattenTransformer());
		return this;
	}

	juxt(fns) {
		this.transformers.unshift(new JuxtTransformer(fns));
		return this;
	}

	namedJuxt(fns) {
		this.transformers.unshift(new NamedJuxtTransformer(fns));
		return this;
	}

	// reductions
	transduce(reducer) {
		let transformer = reducer;
		for (let i = 0; i < this.transformers.length; i += 1) {
			this.transformers[i].downstream = transformer;
			transformer = this.transformers[i];
		}
		return this.source(transformer);
	}

	groupBy(fn) {
		return this.transduce(new GroupByReducer(fn));
	}

	toValue() {
		return this.transduce(new ValueReducer());
	}

	toArray() {
		return this.transduce(new ArrayReducer());
	}

	toObject() {
		return this.transduce(new ObjectReducer());
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

// single value
function valueSource(value) {
	return function(transformer) {
		let result = transformer.init();
		result = transformer.step(result, value);
		return transformer.result(result);
	};
}

// [start, end
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

// array
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

// ES6 like iterator
function iteratorSource(iterator) {
	return function(transformer) {
		let result = transformer.init();
		for (;;) {
			let it = iterator.next();
			if (it.done) {
				break;
			}
			result = transformer.step(result, it.value);
			if (result instanceof Reduced) {
				break;
			}
		}
		return transformer.result(result);
	};
}

// exported API functions
function fromValue(value) {
	return new Pipeline(valueSource(value));
}

function fromRange(start, end) {
	return new Pipeline(rangeSource(start, end));
}

function fromArray(array) {
	return new Pipeline(arraySource(array));
}

function fromIterator(iterator) {
	return new Pipeline(iteratorSource(iterator));
}

// workaround for browser
var exports = {};
export {
	fromValue,
	fromRange,
	fromArray,
	fromIterator
}

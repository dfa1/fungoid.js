// Objectives:
// - decoupling transformations from input and output
//     transformations are composable and unit-testable functions such as map(), filter(), reduce(), take(), drop(), etc
//     input can be any ES6-like iterator, the library provides some basic iterators
//     output can be arrays, objects, pure side effect (i.e. console.log())
// - no intermediate allocations, unlike other libraries
//
// Assumptions:
// - no library dependencies
// - Object.keys()

/* exported Fungoid */
var Fungoid = (function() {
	'use strict';

	// ES6-like iterator protocol
	function done() {
		return { done: true };
	}

	function value(e) {
		return { done: false, value: e };
	}

	// ES6-like iterator
	// yields numbers in range [from, to)
	// step can be omitted, defaults to 1
	function range_input_iterator(from, to, step) {
		var s = step || 1;
		var i = from;
		function next() {
			if (i < to) {
				var r = i;
				i += s;
				return value(r);
			} else {
				return done();
			}
		}
		return {
			next: next
		};
	}

	// ES6-like iterator
	// yields array[i]
	function array_input_iterator(array) {
		var i = 0;
		function next() {
			if (i < array.length) {
				var r = array[i];
				i += 1;
				return value(r);
			} else {
				return done();
			}
		}
		return {
			next: next
		};
	}

	// ES6-like iterator
	// yields [k, object[k]]
	function object_input_iterator(object) {
		var i = 0;
		var keys = Object.keys(object);
		function next() {
			if (i < keys.length) {
				var k = keys[i];
				var v = object[k];
				i += 1;
				return value([k, v]);
			} else {
				return done();
			}
		}
		return {
			next: next
		};
	}

	// output protocol
	// step(value)   zero or more times
	// result()      called once

	// push() to array
	function appending_array_output(array) {
		var state = array || [];
		return {
			step:   function(value) { state.push(value); },
			result: function()      { return state; }
		};
	}

	// unshift() to array
	function prepending_array_output(array) {
		var state = array || [];
		return {
			step:   function(value) { state.unshift(value); },
			result: function()      { return state; }
		};
	}

	// keep only the last step() value
	// if step() is never called throws
	function keeplast_output_safe() {
		var guard = {};
		var state = guard;
		return {
			step: function(value)    { state = value; },
			result: function() {
				if (state === guard) {
					throw new Error("step() never called");
				}
				return state;
			}
		};
	}

	// keep only the last step() value
	// if step() is never called returns ''
	function keeplast_output(init) {
		var state = init;
		return {
			step: function(value)    { state = value; },
			result: function() {
				return state;
			}
		};
	}


	function group_by(fn) {
		var groups = {};
		return {
			step:   function(value) {
				var key = fn(value);
				if (!groups[key]) {
					groups[key]= [];
				}
				groups[key].push(value);
			},
			result: function() {
				return groups;
			}
		};
	}


	function identity() {
		return function(e) {
			return { accepted: true, value: e };
		};
	}

	function map(fn) {
		return function(e) {
			return { accepted: true, value: fn(e) };
		};
	}

	function filter(fn) {
		return function(e) {
			return { accepted: fn(e), value: e };
		};
	}

	// TODO: state pattern
	function take(n) {
		if (n < 0) {
			throw new Error("n cannot be negative: " + n);
		}
		var i = n;
		return function(e) {
			var accepted = i > 0;
			i -= 1;
			if (accepted) {
				return { accepted: true, value: e };
			} else {
				return { done: true };
			}
		};
	}

	// TODO: state pattern
	function drop(n) {
		if (n < 0) {
			throw new Error("n cannot be negative: " + n);
		}
		var i = 0;
		return function(e) {
			var accepted = i >= n;
			i += 1;
			return { accepted: accepted, value: e };
		};
	}

	function reduce(fn) {
		var value;
		var hasInit = false;
		return function(e) {
			if (hasInit) {
				value = fn(value, e);
				return { accepted: true, value: value };
			} else {
				hasInit = true;
				value = e;
				return { accepted: true, value: e };
			}
		};
	}

	function distinct() {
		var seen = {};
		return function(e) {
			if (seen.hasOwnProperty(e)) {
				return { accepted: false, value: e };
			} else {
				seen[e] = true;
				return { accepted: true, value: e };
			}
		};
	}

	// compositions

	// pipeline(f,g,h)(x) -> h(g(f(x)))
	function pipeline() {
		var fns = Array.prototype.slice.call(arguments);
		return function(e) {
			var prev = e;
			for (var i = 0; i < fns.length; i += 1) {
				var fn = fns[i];
				var outcome = fn(prev);
				if (outcome.done) {
					return { done: true };
				}
				if (!outcome.accepted) {
					return { accepted: false, value: prev };
				}
				prev = outcome.value;
			}
			return { accepted: true, value: prev };
		};
	}

	// juxt(f,g,h)(x) -> [f(x),g(x),h(x)]
	// outcomes with done=true are ignored
	function juxt() {
		var fns = Array.prototype.slice.call(arguments);
		return function(e) {
			var res = [];
			for (var i = 0; i < fns.length; i += 1) {
				var fn = fns[i];
				var outcome = fn(e);
				if (outcome.accepted) {
					res.push(outcome.value);
				} else {
					res.push(undefined); // TODO: don't leave a hole in the array
				}
			}
			return { accepted: true, value: res };
		};
	}

	// named_juxt({a:f,b:g,c:h})(x) -> {a:f(x),b:g(x),c:h(x)}
	// just a shortand for juxt + map
	// outcomes with done=true are ignored
	function named_juxt(fns) {
		var keys = Object.keys(fns);
		return function(e) {
			var res = {};
			for (var i = 0; i < keys.length; i += 1) {
				var k = keys[i];
				var fn = fns[k];
				var outcome = fn(e);
				if (outcome.accepted) {
					res[k] = outcome.value;
				}
			}
			return { accepted: true, value: res };
		};
	}

	// algorithms
	function transform(input, fn, output) {
		for (;;) {
			var it = input.next();
			if (it.done) {
				break;
			}
			var outcome = fn(it.value);
			if (outcome.done) {
				break;
			}
			if (outcome.accepted) {
				output.step(outcome.value);
			}
		}
		return output.result();
	}

	var public_api = {

		// input iterators
		range_input_iterator: range_input_iterator,
		array_input_iterator: array_input_iterator,
		object_input_iterator: object_input_iterator,

		// output
		appending_array_output: appending_array_output,
		prepending_array_output: prepending_array_output,
		keeplast_output: keeplast_output,
		keeplast_output_safe: keeplast_output_safe,
		group_by: group_by,

		// transformations
		identity: identity,
		map: map,
		filter: filter,
		take: take,
		drop: drop,
		reduce: reduce,
		distinct: distinct,
		pipeline: pipeline,
		juxt: juxt,
		named_juxt: named_juxt,

		// algorithms
		transform: transform

	};
	return public_api;
}());

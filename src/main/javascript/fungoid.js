// Objectives:
// - decoupling transformations from input and output
//     input is a function that when called produces one value
//     output is a function that when called procedes a side effect (i.e. push() into an array)
//     transformations as reusable and unit-testable functions
// - no intermediate allocations unlike underscore.js, lodash, etc
// - map, filter, reduce, take, drop, distinct
// - no external dependencies

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
	// [from, to)
	function range_input_iterator(from, to) {
		var i = from;
		function next() {
			if (i < to) {
				return value(i++);
			} else {
				return done();
			}
		}
		return {
			next: next
		};
	}

	// ES6-like iterator
	function array_input_iterator(array) {
		var i = 0;
		function next() {
			if (i < array.length) {
				return value(array[i++]);
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

	// append to array
	function appending_array_output(array) {
		var state = array || [];
		return {
			step:   function(value) { state.push(value); },
			result: function()      { return state; }
		};
	}

	// keep only the last step() value
	// if step() is never called throws
	function keeplast_output() {
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

	// TODO: prepending_array_output
	// TODO: keeplast_or_default

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
			var accepted = i-- > 0;
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
			return { accepted: i++ >= n, value: e };
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

	// TODO: maybe pipeline is a better name?
	// compose(f,g,h)(x) -> h(g(f(x)))
	function compose() {
		var fns = Array.prototype.slice.call(arguments);
		return function(e) {
			var prev = e;
			for (var i = 0; i < fns.length; i++) {
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
	// TODO: handle done
	function juxt() {
		var fns = Array.prototype.slice.call(arguments);
		return function(e) {
			var res = [];
			for (var i = 0; i < fns.length; i++) {
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
	// TODO: handle done
	function named_juxt(fns) {
		return function(e) {
			var res = {};
			for (var k in fns) {
				if (fns.hasOwnProperty(k)) {
					var fn = fns[k];
					var outcome = fn(e);
					if (outcome.accepted) {
						res[k] = outcome.value;
					}
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

		// input/output iterators
		range_input_iterator: range_input_iterator,
		array_input_iterator: array_input_iterator,
		appending_array_output: appending_array_output,
		keeplast_output: keeplast_output,
		group_by: group_by,

		// transformations
		identity: identity,
		map: map,
		filter: filter,
		take: take,
		drop: drop,
		reduce: reduce,
		distinct: distinct,
		compose: compose,
		juxt: juxt,
		named_juxt: named_juxt,

		// algorithms
		transform: transform

	};
	return public_api;
}());

'use strict';

// Objectives:
// - decoupling transformations from input and output
//     input is a function that when called produces one value
//     output is a function that when called procedes a side effect (i.e. push() into an array)
//     transformations as reusable and unit-testable functions
// - map, filter, reduce, take, drop, takeWhile, dropWhile, dedup
// - no external dependencies

// TODO:
//  - transform() return value is not always usable
//    (e.g. array_output_iterator never called yields undefined)
var Fungoid = {

	// ES6-like iterator protocol
	done: function() {
		return { done: true };
	},

	value: function(e) {
		return { done: false, value: e };
	},

	// [from, to)
	range_input_iterator: function(from, to) {
		var i = from;
		return function() {
			if (i < to) {
				return Fungoid.value(i++);
			} else {
				return Fungoid.done();
			}
		};
	},

	array_input_iterator: function(array) {
		var i = 0;
		return function() {
			if (i < array.length) {
				return Fungoid.value(array[i++]);
			} else {
				return Fungoid.done();
			}
		};
	},

	array_output_iterator: function(array) {
		return function(e) {
			array.push(e);
			return array;
		};
	},

	save_output_iterator: function() {
		return function(e) {
			return e;
		};
	},

	identity: function(fn) {
		return function(e) {
			return { accepted: true, value: e };
		};
	},

	mapper: function(fn) {
		return function(e) {
			return { accepted: true, value: fn(e) };
		};
	},

	filter: function(fn) {
		return function(e) {
			return { accepted: fn(e), value: e };
		};
	},

	take: function(n) {
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
	},

	drop: function(n) {
		if (n < 0) {
			throw new Error("n cannot be negative: " + n);
		}
		var i = 0;
		return function(e) {
			return { accepted: i++ >= n, value: e };
		};
	},

	reduce: function(fn) {
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
	},

	compose: function() {
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
	},

	transform: function(input, fn, output) {
		var res;
		for (;;) {
			var it = input();
			if (it.done) {
				break;
			}
			var outcome = fn(it.value);
			if (outcome.done) {
				break;
			}
			if (outcome.accepted) {
				res = output(outcome.value);
			}
		}
		return res;
	}
};

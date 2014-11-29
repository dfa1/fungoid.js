'use strict';

var Fungoid = {

	// ES6-like iterator protocol
	done: function() {
		return {
			done: true
		};
	},

	value: function(e) {
		return {
			value: e,
			done: false
		};
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
		};
	},

	identity: function(fn) {
		return function(e, output) {
			output(e);
		};
	},

	mapper: function(fn) {
		return function(e, output) {
			output(fn(e));
		};
	},

	filter: function(fn) {
		return function(e, output) {
			var accepted = fn(e);
			if (accepted) {
				output(e);
			}
		};
	},

	take: function(n) {
		var i = n;
		return function(e, output) {
			if (i-- > 0) {
				output(e);
			}
		};
	},

	drop: function(n) {
		var i = 0;
		return function(e, output) {
			if (i++ >= n) {
				output(e);
			}
		};
	},


	transform: function(input, fn, output) {
		for (;;) {
			var it = input();
			if (it.done) {
				break;
			}
			fn(it.value, output);
		}
	}
};

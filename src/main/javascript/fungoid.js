'use strict';

var Fungoid = {

	array_input_iterator: function(array) {
		var i = 0;
		return function() {
			if (i < array.length) {
				return {
					value: array[i++],
					done: false
				};
			} else {
				return {
					done: true
				};
			}
		};
	},

	array_output_iterator: function(array) {
		return function(e) {
			array.push(e);
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
			i++;
			if (i > n) {
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

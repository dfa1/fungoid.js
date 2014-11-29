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

	transform: function(input, fn, output) {
		for (;;) {
			var it = input();
			if (!it.done) {
				fn(it.value, output);
			} else {
				break;
			}
		}
	}
};

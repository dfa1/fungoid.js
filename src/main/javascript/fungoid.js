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

	array_output_iterator: function() {
		var output = [];
		return function(e) {
			output.push(e);
			return output;
		};
	},

	mapper: function(fn) {
		return function(e) {
			return fn(e);
		};
	},

	transform: function(input, fn, output) {
		for (;;) {
			var it = input();
			if (!it.done) {
				var res = output(fn(it.value));
			} else {
				break;
			}
		}
		return res;
	}
};

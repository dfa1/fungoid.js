'use strict';

describe("fungoid", function() {
	it('transform array', function() {
		var input = [ 1, 2, 3 ];
		var output = [];
		Fungoid.transform(
			Fungoid.array_input_iterator(input),
			Fungoid.mapper(function(x) { return x + 1; }),
			Fungoid.array_output_iterator(output)
		);
		expect(output).toEqual([ 2, 3, 4]);
	});

	it('transform empty array', function() {
		var input = [];
		var output = [];
		Fungoid.transform(
			Fungoid.array_input_iterator(input),
			Fungoid.mapper(function(x) { return x + 1; }),
			Fungoid.array_output_iterator(output)
		);
		expect(output).toEqual([]);
	});

});

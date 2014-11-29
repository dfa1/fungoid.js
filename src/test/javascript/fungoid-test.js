'use strict';

describe("fungoid", function() {

	describe("mapper", function() {
		it('map array', function() {
			var input = [ 1, 2, 3 ];
			var output = [];
			Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.mapper(function(x) { return x + 1; }),
				Fungoid.array_output_iterator(output)
				);
			expect(output).toEqual([ 2, 3, 4]);
		});

		it('map empty array', function() {
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

	describe("filter", function() {
		it('filter array', function() {
			var input = [ 1, 2, 3 ];
			var output = [];
			Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.filter(function(x) { return x % 2; }),
				Fungoid.array_output_iterator(output)
				);
			expect(output).toEqual([ 1, 3 ]);
		});

		it('filter empty array', function() {
			var input = [];
			var output = [];
			Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.filter(function(x) { return x % 2; }),
				Fungoid.array_output_iterator(output)
				);
			expect(output).toEqual([]);
		});
	});

	describe("drop", function() {
		it('drop array', function() {
			var input = [ 1, 2, 3 ];
			var output = [];
			Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.drop(1),
				Fungoid.array_output_iterator(output)
				);
			expect(output).toEqual([ 2, 3 ]);
		});

		it('drop empty array', function() {
			var input = [];
			var output = [];
			Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.drop(1),
				Fungoid.array_output_iterator(output)
				);
			expect(output).toEqual([]);
		});
	});

	describe("take", function() {
		it('take array', function() {
			var input = [ 1, 2, 3 ];
			var output = [];
			Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.take(1),
				Fungoid.array_output_iterator(output)
				);
			expect(output).toEqual([ 1 ]);
		});

		it('take empty array', function() {
			var input = [];
			var output = [];
			Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.take(1),
				Fungoid.array_output_iterator(output)
				);
			expect(output).toEqual([]);
		});
	});

	describe("range", function() {
		it('range', function() {
			var output = [];
			Fungoid.transform(
				Fungoid.range_input_iterator(10, 13),
				Fungoid.identity(),
				Fungoid.array_output_iterator(output)
				);
			expect(output).toEqual([10, 11, 12]);
		});
	});

});

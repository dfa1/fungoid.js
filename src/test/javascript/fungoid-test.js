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
		it('range->array', function() {
			var output = [];
			Fungoid.transform(
				Fungoid.range_input_iterator(10, 13),
				Fungoid.identity(),
				Fungoid.array_output_iterator(output)
				);
			expect(output).toEqual([10, 11, 12]);
		});
	});

	describe("reduce", function() {
		it('first value is not ignored', function() {
			var input = [ 12, 11, 10, 9 ] ;
			var max = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.reduce(Math.max),
				Fungoid.save_output_iterator()
			);
			expect(max).toEqual(12);
		});
		it('last value is not ignoed', function() {
			var input = [ 1, 2, 3, 12 ] ;
			var max = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.reduce(Math.max),
				Fungoid.save_output_iterator()
			);
			expect(max).toEqual(12);
		});

	});

	describe("compose", function() {
		it("one function", function() {
			var fn = Fungoid.compose(
				Fungoid.identity()
			);
			var outcome = fn(1);
			expect(outcome.accepted).toEqual(true);
		});

		it("first function discards", function() {
			var fn = Fungoid.compose(
				Fungoid.filter(function(e) { return e == 2; }),
				Fungoid.identity()
			);
			var outcome = fn(1);
			expect(outcome.accepted).toEqual(false);
		});

		it("accepted by all steps", function() {
			var fn = Fungoid.compose(
				Fungoid.filter(function(e) { return e == 1; }),
				Fungoid.mapper(function(e) { return "" + e; })
			);
			var outcome = fn(1);
			expect(outcome.value).toEqual("1");
		});

	});

	describe("integration", function() {

		it("filter->map", function() {
			var fn = Fungoid.compose(
				Fungoid.filter(function(e) { return e % 100000 == 0; }),
				Fungoid.mapper(function(e) { return "" + e; })
			);
			var output = [];
			Fungoid.transform(
				Fungoid.range_input_iterator(1, 500000),
				fn,
				Fungoid.array_output_iterator(output)
				);
			expect(output).toEqual([ "100000", "200000", "300000", "400000" ]);
		});

	});

});

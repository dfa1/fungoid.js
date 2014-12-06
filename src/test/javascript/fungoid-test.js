// warning: these tests are not written in BDD style
describe("fungoid", function() {
	'use strict';

	describe("map", function() {

		it('one item', function() {
			var input = [ 1 ];
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.map(function(x) { return x + 1; }),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([ 2 ]);
		});

		it('two items', function() {
			var input = [ 1, 2 ];
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.map(function(x) { return x + 1; }),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([ 2, 3 ]);
		});

		it('zero items', function() {
			var input = [];
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.map(function(x) { return x + 1; }),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([]);
		});

	});

	describe("filter", function() {

		it('accept one item', function() {
			var input = [ 2 ];
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.filter(function(x) { return x % 2 === 0; }),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([ 2 ]);
		});

		it('discard one item', function() {
			var input = [ 1 ];
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.filter(function(x) { return x % 2 === 0; }),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([]);
		});


		it('discard all', function() {
			var input = [ 1, 2, 3 ];
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.filter(function(x) { return x > 4; }),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([]);
		});

		it('accept all', function() {
			var input = [ 1, 2, 3 ];
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.filter(function(x) { return x < 4; }),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([ 1, 2, 3]);
		});

	});

	describe("drop", function() {

		it('one item', function() {
			var input = [ 1, 2, 3 ];
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.drop(1),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([ 2, 3 ]);
		});

		it('two items', function() {
			var input = [ 1, 2, 3 ];
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.drop(2),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([ 3 ]);
		});

		it('zero items', function() {
			var input = [ 1, 2, 3 ];
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.drop(0),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([ 1, 2, 3 ]);
		});

		it('more items than input', function() {
			var input = [ 1, 2, 3 ];
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.drop(input.length + 1),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([]);
		});

		it('-1 items', function() {
			expect(function() {
				Fungoid.drop(-1);
			}).toThrow(new Error("n cannot be negative: -1"));
		});

		it('from empty source', function() {
			var input = [];
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.drop(1),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([]);
		});

	});

	describe("take", function() {

		it('one item', function() {
			var input = [ 1, 2, 3 ];
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.take(1),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([ 1 ]);
		});

		it('two items', function() {
			var input = [ 1, 2, 3 ];
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.take(2),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([ 1, 2 ]);
		});

		it('zero items', function() {
			var input = [ 1, 2, 3 ];
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.take(0),
				Fungoid.appending_array_output()
				);
			expect(output).toEqual([]);
		});

		it('-1 items', function() {
			expect(function() {
				Fungoid.take(-1);
			}).toThrow(new Error("n cannot be negative: -1"));
		});

		it('more items than input', function() {
			var input = [ 1, 2, 3 ];
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.take(input.length + 1),
				Fungoid.appending_array_output()
				);
			expect(output).toEqual(input);
		});

		it('from empty source', function() {
			var input = [];
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.take(1),
				Fungoid.appending_array_output()
				);
			expect(output).toEqual([]);
		});

		it('short circuit', function() {
			var count = 0 ;
			var fn = Fungoid.compose(
				Fungoid.take(5),
				Fungoid.map(function(e) { count++; return e; })
			);
			Fungoid.transform(
				Fungoid.range_input_iterator(1, 50),
				fn,
				Fungoid.appending_array_output()
				);
			expect(count).toEqual(5);
		});
	});

	describe("range", function() {

		it('range->array', function() {
			var output = Fungoid.transform(
				Fungoid.range_input_iterator(10, 13),
				Fungoid.identity(),
				Fungoid.appending_array_output()
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
				Fungoid.keeplast_output()
			);
			expect(max).toEqual(12);
		});
		it('last value is not ignored', function() {
			var input = [ 1, 2, 3, 12 ] ;
			var max = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.reduce(Math.max),
				Fungoid.keeplast_output()
			);
			expect(max).toEqual(12);
		});
	});

	describe("distinct", function() {

		it('one item', function() {
			var input = [ 1 ] ;
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.distinct(),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([ 1 ]);
		});

		it('two equivalent items', function() {
			var input = [ 1, 1 ] ;
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.distinct(),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([ 1 ]);
		});

		it('two distinct items', function() {
			var input = [ 1, 2 ] ;
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.distinct(),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([ 1, 2 ]);
		});

		it('non consecutive equivalent items', function() {
			var input = [ 1, 2, 1 ] ;
			var output = Fungoid.transform(
				Fungoid.array_input_iterator(input),
				Fungoid.distinct(),
				Fungoid.appending_array_output()
			);
			expect(output).toEqual([ 1, 2 ]);
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
				Fungoid.filter(function(e) { return e === 2; }),
				Fungoid.identity()
			);
			var outcome = fn(1);
			expect(outcome.accepted).toEqual(false);
		});

		it("accepted by all steps", function() {
			var fn = Fungoid.compose(
				Fungoid.filter(function(e) { return e === 1; }),
				Fungoid.map(function(e) { return "" + e; })
			);
			var outcome = fn(1);
			expect(outcome.value).toEqual("1");
		});

		it("values flows between one step to another", function() {
			var fn = Fungoid.compose(
				Fungoid.map(function(e) { return e + 1; }),
				Fungoid.map(function(e) { return e - 1; })
			);
			var outcome = fn(1);
			expect(outcome.value).toEqual(1);
		});
	});

	describe("juxt", function() {

		it("zero functions", function() {
			var outcome = Fungoid.juxt()(1);
			expect(outcome).toEqual({ accepted: true, value: [ ]});
		});

		it("one function", function() {
			var inc = Fungoid.map(function(e) { return e + 1; });
			var outcome = Fungoid.juxt(inc)(1);
			expect(outcome).toEqual({ accepted: true, value: [ 2 ]});
		});

		it("two functions", function() {
			var inc = Fungoid.map(function(e) { return e + 1; });
			var dec = Fungoid.map(function(e) { return e - 1; });
			var outcome = Fungoid.juxt(inc, dec)(1);
			expect(outcome).toEqual({ accepted: true, value: [ 2, 0 ]});
		});

		it("with rejected value", function() {
			var fn = Fungoid.filter(function(e) { return e !== 1; });
			var outcome = Fungoid.juxt(fn)(1);
			expect(outcome).toEqual({ accepted: true, value: [ undefined ]});
		});

	});

	describe("named_juxt", function() {

		it("zero functions", function() {
			var outcome = Fungoid.named_juxt()(1);
			expect(outcome).toEqual({ accepted: true, value: {}});
		});

		it("one function", function() {
			var inc = Fungoid.map(function(e) { return e + 1; });
			var outcome = Fungoid.named_juxt({next: inc})(1);
			expect(outcome).toEqual({ accepted: true, value: { next: 2 }});
		});

		it("two functions", function() {
			var inc = Fungoid.map(function(e) { return e + 1; });
			var dec = Fungoid.map(function(e) { return e - 1; });
			var outcome = Fungoid.named_juxt({ next: inc, prev: dec })(1);
			expect(outcome).toEqual({ accepted: true, value: { next: 2, prev: 0} });
		});

		it("one function", function() {
			var fn = Fungoid.filter(function(e) { return e !== 1; });
			var outcome = Fungoid.named_juxt({ next: fn })(1);
			expect(outcome).toEqual({ accepted: true, value: { next: undefined }});
		});

	});

	describe("demo", function() {

		it("even_or_odd", function() {
			var output = Fungoid.transform(
				Fungoid.range_input_iterator(1, 5),
				Fungoid.identity(),
				Fungoid.group_by(function(e) { return e % 2 ? "odd" : "even"; })
				);
			expect(output).toEqual({ odd: [ 1, 3 ], even: [ 2, 4 ] });
		});

		it("fizzbuzz with named_juxt", function() {
			var output = Fungoid.transform(
				Fungoid.range_input_iterator(1, 21),
				Fungoid.compose(
					Fungoid.named_juxt({ 
						untouched: Fungoid.identity(), 
						fizz:  Fungoid.filter(function(e) { return e % 3 === 0; }),
						buzz:  Fungoid.filter(function(e) { return e % 5 === 0; }),
					}),
					Fungoid.map(function(e) {
						if (e.fizz && e.buzz) {
							return "fizzbuzz";
						}
						if (e.fizz) {
							return "fizz";
						}
						if (e.buzz) {
							return "buzz";
						}
						return e.untouched;
					}
					)
				),
				Fungoid.appending_array_output()
				);
			expect(output).toEqual([ 1, 2, "fizz", 4, "buzz", "fizz", 7, 8, "fizz", "buzz", 11, "fizz", 13, 14, "fizzbuzz", 16, 17, "fizz", 19, "buzz" ]);
		});

	});

	describe("stress tests", function() {

		it("filter->map many items", function() {
			var fn = Fungoid.compose(
				Fungoid.filter(function(e) { return e % 100000 === 0; }),
				Fungoid.map(function(e) { return String(e); })
			);
			var output = Fungoid.transform(
				Fungoid.range_input_iterator(1, 500000),
				fn,
				Fungoid.appending_array_output()
				);
			expect(output).toEqual([ "100000", "200000", "300000", "400000" ]);
		});



	});

});

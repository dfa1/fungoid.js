var Fungoid = require("./build/fungoid.js");

describe("demo", function() {
	'use strict';

	it('range -> array', function() {
		var outcome = Fungoid.Transducer.fromRange(10, 13).toArray();
		expect(outcome).toEqual([10, 11, 12]);
	});

	it('range -> inc -> array', function() {
		var inc = function(i) { return i + 1; };
		var outcome = Fungoid.Transducer.fromRange(10, 13).map(inc).toArray();
		expect(outcome).toEqual([11, 12, 13]);
	});

	it('range -> map -> map -> array', function() {
		var inc = function(i) { return i + 1; };
		var dec = function(i) { return i - 1; };
		var outcome = Fungoid.Transducer.fromRange(10, 13).map(inc).map(dec).toArray();
		expect(outcome).toEqual([10, 11, 12]);
	});

	it('range -> filter -> map -> array', function() {
		var inc = function(i) { return i + 1; };
		var isEven = function(i) { return i % 2 === 0; };
		var outcome = Fungoid.Transducer.fromRange(10, 13).filter(isEven).map(inc).toArray();
		expect(outcome).toEqual([11, 13]);
	});

	it('range -> map -> filter -> array', function() {
		var inc = function(i) { return i + 1; };
		var isEven = function(i) { return i % 2 === 0; };
		var outcome = Fungoid.Transducer.fromRange(10, 13).map(inc).filter(isEven).toArray();
		expect(outcome).toEqual([12]);
	});

	it('range -> scalar (min)', function() {
		var outcome = Fungoid.Transducer.fromRange(10, 13).min();
		expect(outcome).toEqual(10);
	});

	it('range -> take(1) -> array', function() {
		var outcome = Fungoid.Transducer.fromRange(10, 13).take(1).toArray();
		expect(outcome).toEqual([10]);
	});

	it('range -> take(3) -> array', function() {
		var outcome = Fungoid.Transducer.fromRange(10, 13).take(3).toArray();
		expect(outcome).toEqual([10, 11, 12]);
	});

	it('range -> take(0) -> array', function() {
		var outcome = Fungoid.Transducer.fromRange(10, 13).take(0).toArray();
		expect(outcome).toEqual([]);
	});

	it("range -> drop -> take -> array", function() {
		var outcome = Fungoid.Transducer.fromRange(1, 5).drop(2).take(1).toArray();
		expect(outcome).toEqual([ 3 ]);
	});

	it("range -> map -> sum", function() {
		var pow2 = function(n) { return Math.pow(2, n); };
		var outcome = Fungoid.Transducer.fromRange(0, 11).map(pow2).sum();
		expect(outcome).toEqual(2047);
	});

	it("array -> max", function() {
		var outcome = Fungoid.Transducer.fromArray([-1, 2]).max();
		expect(outcome).toEqual(2);
	});

	it("empty array -> max", function() {
		var outcome = Fungoid.Transducer.fromArray([]).max();
		expect(outcome).toEqual(-Infinity);
	});

	it("array -> flatten -> array ", function() {
		var outcome = Fungoid.Transducer.fromArray([[1,2], [[[3]]], [4, [5]]]).flatten().toArray();
		expect(outcome).toEqual([1,2,3,4,5]);
	});

	/*
	it("even_or_odd", function() {
		var even_or_odd = function(e) { return e % 2 ? "odd" : "even"; };
		var outcome = Fungoid.Pipeline.ofRange(1, 5).toGroups(even_or_odd);
		expect(outcome).toEqual({ odd: [ 1, 3 ], even: [ 2, 4 ] });
	});

	it("fizzbuzz with named_juxt", function() {
		var output = Fungoid.transform(
			Fungoid.range_input_iterator(1, 21),
			Fungoid.pipeline(
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
	*/

});

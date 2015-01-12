var Fungoid = require("./build/fungoid.js");

describe("demo", function() {
	'use strict';

	it('range -> array', function() {
		var outcome = Fungoid.fromRange(10, 13).toArray();
		expect(outcome).toEqual([10, 11, 12]);
	});

	it('range -> inc -> array', function() {
		var inc = function(i) { return i + 1; };
		var outcome = Fungoid.fromRange(10, 13).map(inc).toArray();
		expect(outcome).toEqual([11, 12, 13]);
	});

	it('range -> map -> map -> array', function() {
		var inc = function(i) { return i + 1; };
		var dec = function(i) { return i - 1; };
		var outcome = Fungoid.fromRange(10, 13).map(inc).map(dec).toArray();
		expect(outcome).toEqual([10, 11, 12]);
	});

	it('range -> filter -> map -> array', function() {
		var inc = function(i) { return i + 1; };
		var isEven = function(i) { return i % 2 === 0; };
		var outcome = Fungoid.fromRange(10, 13).filter(isEven).map(inc).toArray();
		expect(outcome).toEqual([11, 13]);
	});

	it('range -> map -> filter -> array', function() {
		var inc = function(i) { return i + 1; };
		var isEven = function(i) { return i % 2 === 0; };
		var outcome = Fungoid.fromRange(10, 13).map(inc).filter(isEven).toArray();
		expect(outcome).toEqual([12]);
	});

	it('range -> scalar (min)', function() {
		var outcome = Fungoid.fromRange(10, 13).min();
		expect(outcome).toEqual(10);
	});

	it('range -> take(1) -> array', function() {
		var outcome = Fungoid.fromRange(10, 13).take(1).toArray();
		expect(outcome).toEqual([10]);
	});

	it('range -> take(3) -> array', function() {
		var outcome = Fungoid.fromRange(10, 13).take(3).toArray();
		expect(outcome).toEqual([10, 11, 12]);
	});

	it('range -> take(0) -> array', function() {
		var outcome = Fungoid.fromRange(10, 13).take(0).toArray();
		expect(outcome).toEqual([]);
	});

	it("range -> drop -> take -> array", function() {
		var outcome = Fungoid.fromRange(1, 5).drop(2).take(1).toArray();
		expect(outcome).toEqual([ 3 ]);
	});

	it("range -> map -> sum", function() {
		var pow2 = function(n) { return Math.pow(2, n); };
		var outcome = Fungoid.fromRange(0, 11).map(pow2).sum();
		expect(outcome).toEqual(2047);
	});

	it("array -> max", function() {
		var outcome = Fungoid.fromArray([-1, 2]).max();
		expect(outcome).toEqual(2);
	});

	it("empty array -> max", function() {
		var outcome = Fungoid.fromArray([]).max();
		expect(outcome).toEqual(-Infinity);
	});

	it("array -> flatten -> array ", function() {
		var outcome = Fungoid.fromArray([[1,2], [[[3]]], [4, [5]]]).flatten().toArray();
		expect(outcome).toEqual([1,2,3,4,5]);
	});

	function makeIterator(n) {
		var nextValue = 0;
		return {
			next: function() {
				return nextValue < n ?
				{value: nextValue++, done: false} :
				{done: true};
			}
		};
	}

	it("iterator -> array", function() {
		var iterator = makeIterator(5);
		var outcome = Fungoid.fromIterator(iterator).toArray();
		expect(outcome).toEqual([0,1,2,3,4]);
	});

	it("value -> value", function() {
		var outcome = Fungoid.fromValue(1).toValue();
		expect(outcome).toEqual(1);
	});

	it("value -> map -> value", function() {
		var identity = function(x) { return x; };
		var outcome = Fungoid.fromValue(1).map(identity).toValue();
		expect(outcome).toEqual(1);
	});

	it("array -> juxt -> array", function() {
		var inc = function(n) { return n + 1; };
		var dec = function(n) { return n - 1; };
		var outcome = Fungoid.fromArray([0, 1]).juxt([inc, dec]).toArray();
		expect(outcome).toEqual([[1, -1,], [2, 0]]);
	});

	it("array -> namedJuxt -> array", function() {
		var inc = function(n) { return n + 1; };
		var dec = function(n) { return n - 1; };
		var outcome = Fungoid.fromArray([0, 1]).namedJuxt({x: inc, y: dec}).toArray();
		expect(outcome).toEqual([{x: 1, y: -1},{x: 2, y: 0}]);
	});

   it("range -> groupBy", function() {
	   var even_or_odd = function(e) { return e % 2 ? "odd" : "even"; };
	   var outcome = Fungoid.fromRange(1, 5).groupBy(even_or_odd);
	   expect(outcome).toEqual({ odd: [ 1, 3 ], even: [ 2, 4 ] });
   });

});

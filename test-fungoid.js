var Fungoid = require('./build/fungoid.js');

describe("fungoid", function() {
	'use strict';

	describe("array iterator", function() {

		it("yields done on empty array", function() {
			var input = [];
			var iter = new Fungoid.ArrayIterator(input);
			expect(iter.next()).toEqual({ done: true });
		});

		it("yields array element", function() {
			var input = [ 1 ];
			var iter = new Fungoid.ArrayIterator(input);
			expect(iter.next()).toEqual({ done: false, value: 1 });
			expect(iter.next()).toEqual({ done: true });
		});

		it("yields done after array element", function() {
			var input = [ 1 ];
			var iter = new Fungoid.ArrayIterator(input);
			iter.next(); // ignoring return value
			expect(iter.next()).toEqual({ done: true });
		});

	});

	describe('filter iterator', function() {

		it('forwards value when fn yields true', function() {
			var always = function() {
				return true;
			};
			var iter = new Fungoid.FilterIterator(always, new Fungoid.ArrayIterator([1]));
			var it = iter.next();
			expect(it).toEqual({ done: false, value: 1 });
		});

		it('discards value when fn yields false', function() {
			var never = function() {
				return false;
			};
			var iter = new Fungoid.FilterIterator(never, new Fungoid.ArrayIterator([1]));
			var it = iter.next();
			expect(it).toEqual({ done: true });
		});

		it('handles done', function() {
			var never = function() {
				return false;
			};
			var iter = new Fungoid.FilterIterator(never, new Fungoid.ArrayIterator([1]));
			var it = iter.next();
			expect(it).toEqual({ done: true });
		});

	});
});

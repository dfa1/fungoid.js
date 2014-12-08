describe("perf tests", function() {
	'use strict';

	describe("filter->map", function() {

		var n = 10E5;

		it("using plain js", function() {
			var res = [];
			for (var i = 0; i < n + 1; i += 1) {
				if (i === n) {
					res.push(String(i));
				}
			}
			expect(res).toEqual([String(n)]);
		});

		it("using Fungoid", function() {

			var fn = Fungoid.pipeline(
					Fungoid.filter(function(e) { return e % n === 0; }),
					Fungoid.map(function(e) { return String(e); })
					);
			var output = Fungoid.transform(
					Fungoid.range_input_iterator(1, n + 1),
					fn,
					Fungoid.appending_array_output()
					);
			expect(output).toEqual([ String(n) ]);
		});

	});
});

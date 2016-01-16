'use strict';

var size = 20E3;
var times = 1000;

// node specific stuff
if (typeof require === 'function') {
	var performance = {
		now: require('performance-now')
	};
	var Fungoid = require("./build/fungoid.js");
	if (process.argv.length == 4) {
		times = parseInt(process.argv[2]);
		size = parseInt(process.argv[3]);
	} else {
		console.log("hint: array size and times can be overriden as command line arguments (i.e. node perf.js 1000 1000)");
	}
}

console.log("array size is " + size);
console.log("repeat test " + times + " times");

// helpers
function report(testName, executions) {
	var n = executions.length;
	var worst = -Infinity;
	var best = +Infinity;
	var total = 0;
	for (var i in executions) {
		var current = executions[i].elapsedMillis;
		total += current;
		best = Math.min(best, current);
		worst = Math.max(worst, current);
	}
	var mean = total / n;
	console.log("mean=%sms, best=%sms, worst=%sms of %s executions for '%s'", mean.toFixed(2) , best.toFixed(2), worst.toFixed(2), n, testName);
}

function test(times, fn) {
	var executions = [];
	for (var i = 0; i < times; i += 1) {
		var begin = performance.now()
		var result = fn();
		var end = performance.now();
		var elapsedMillis = (end - begin);
		executions.push({ elapsedMillis: elapsedMillis, result: result });
	}
	return executions;
}

// input and helpers functions
var input = [];
for (var i = 0; i < size; i += 1) {
	input.push(Math.random() * i);
}

var isEven = function(e) {
	return e % 2 === 0;
};

var isMultipleOf100 = function(e) {
	return e % 100 === 0;
};

var toString = function(e) {
	return String(e);
};

// loop
var jsFilterMapExecutions = test(times, function testLoop() {
	var res = [];
	for (var i = 0; i < size; i += 1) {
		var e = input[i];
		if (isEven(e) && isMultipleOf100(e)) {
			res.push(toString(e));
		}
	}
	return res;
});
report("loop", jsFilterMapExecutions);

// array methods
var arrayMethodsExecutions = test(times, function testArray() {
	return input.filter(isEven).filter(isMultipleOf100).map(toString);
});
report("Array", arrayMethodsExecutions);

// Fungoid #1
var fungoidExecutions = test(times, function testFungoid() {
	return Fungoid.fromArray(input).filter(isEven).filter(isMultipleOf100).map(toString).toArray();
});
report("Fungoid #1", fungoidExecutions);

// Fungoid #2 (reuse pipeline)
var pipeline = Fungoid.fromArray(input).filter(isEven).filter(isMultipleOf100).map(toString);
var fungoid2Executions = test(times, function testFungoid() {
	return pipeline.toArray();
});
report("Fungoid #2 (reuse pipeline)", fungoid2Executions);


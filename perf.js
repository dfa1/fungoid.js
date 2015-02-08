'use strict';

// for node.js
if (typeof require === 'function') {
	var Fungoid = require("./build/fungoid.js");
}

function report(testName, executions) {
	var n = 0;
	var totalMillis = 0;
	for (var i in executions) {
		totalMillis += executions[i].elapsedMillis;
		n += 1;
	}
	if (console) {
		console.log(testName + "\n  mean = " + totalMillis / n + " ms for " + n + " executions");
	}
}

function test(times, fn) {
	var executions = [];
	for (var i = 0; i < times; i += 1) {
		var begin = new Date();
		var res = fn();
		var end = new Date();
		var elapsedMillis = (end - begin);
		executions.push({ elapsedMillis: elapsedMillis, returnValue: res });
	}
	return executions;
}

var times = 10;
var size = 10E4;

var input = [];
for (var i = 0; i < size; i += 1) {
	input.push(i);
}

var isEven = function(e) {
	return e % 2 === 0;
};

var toString = function(e) {
	return String(e);
};

// naive loop
var jsFilterMapExecutions = test(times, function() {
	var res = [];
	for (var i = 0; i < size; i += 1) {
		var e = input[i];
		if (isEven(e)) {
			res.push(toString(e));
		}
	}
	return res;
});
report("JS filter->map", jsFilterMapExecutions);

// array methods
var arrayMethodsExecutions = test(times, function() {
	return input.filter(isEven).map(toString);
});
report("Array filter->map", arrayMethodsExecutions);

// Fungoid
var fungoidExecutions = test(times, function() {
	return Fungoid.fromArray(input).filter(isEven).map(toString).toArray();
});
report("Fungoid filter->map", fungoidExecutions);


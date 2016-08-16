/**
 * Harlan James <root@aboyandhisgnu.org> (http://aboyandhisgnu.org)
 *
 * This file is part of Argonaut.js.
 *
 * Argonaut.js is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Argonaut.js is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Argonaut.js.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

const JSONMAP = {
	"{" : "}",
	"[" : "]",
	"\"" : "\""
};

/**
 * @json - string containing valid, albeit non-terminated, JSON.
 * @returns - terminated json string
 */
var argonaut = function(json) {
	var stack = [];    
	var seekv = false;    // Seek value
	var seeke = false;    // Seek end (of array)
	var chari;

	Array.prototype.last = function() {
		var i = this.length;
		var c;

		if (i > 0) {
			c = this[i - 1];
		} else {
			c = null;
		}

		return c; 
	};
	
	// Reject nonsense from downstream developers
	if (typeof json !== 'string') {
		throw new TypeError('Expected string or JSON object, got ' + typeof json);
	}

	json = json.replace(' ', '');
	for (var i = 0; i < json.length; i++) {
		chari = json[i];
		
		switch (chari) {
			case '{':
				stack.push(chari);

				if (seekv == true) {
					seekv = false;
				}

				break;
			case '[':
				stack.push(chari);

				seeke = true;
				if (seekv == true) {
					seekv = false;
				}

				break;
			case '}':

				stack.pop();

				if (seekv == true) {
					seekv = false;
				}
				break;
			case ']':
				
				seeke = false;
				stack.pop();

				break;
			case '\"':
				// Special case for quotation marks because they mark both the ending and
				// the beginning of an entry.

				if (stack.last() == "\"") {
					stack.pop();
				} else {
					stack.push(chari);
				}

				if (seekv == true) {
					seekv = false;
				}
				break;
			case ':':
				seekv = true;
				break;
			default:
				break;
		}
	}

	// Remove trailing comma from array
	if (seeke == true) {
		if (json[json.length - 1] == ',') {
			json = json.slice(0, i-1);
		}
	}

	// Append null value in the case of key without value
	if (seekv == true) {
		json += " null";
	}

	// Append terminating values
	for (var i = stack.length - 1 ; i >= 0; i--) {
		json += JSONMAP[stack[i]];
	}

	return json;
};

var test = function() {
	var test0 = "{";
	var test1 = "{\"";
	var test2 = "{\"key";
	var test3 = "{\"key\":";
	var test4 = "{\"key\": [";
	var test5 = "{\"key\": [0.124,";
	var test6 = "{\"key\": [0.124]";
	var test7 = "{\"key\": [0.124,0.124,0.123], \"anotherKey\": [{},{\"subkey\":[124.01, 1231.0,";
	var test8 = "{\"key\": [0.124,0.124,0.123]}";

	console.log(test0 + " ==> \n" + argonaut(test0));
	console.log(test1 + " ==> \n" + argonaut(test1));
	console.log(test2 + " ==> \n" + argonaut(test2));
	console.log(test3 + " ==> \n" + argonaut(test3));
	console.log(test4 + " ==> \n" + argonaut(test4));
	console.log(test5 + " ==> \n" + argonaut(test5));
	console.log(test6 + " ==> \n" + argonaut(test6));
	console.log(test7 + " ==> \n" + argonaut(test7));
	console.log(test8 + " ==> \n" + argonaut(test8));

	return test7;
};

module.exports = argonaut;
module.exports.test = test;

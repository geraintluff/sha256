(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof module !== 'undefined' && module.exports){
		module.exports = factory();
	} else {
		global.sha256 = factory();
	}
})(this, function () {
	var sha256 = function sha256(ascii) {
	function rightRotate(value, amount) {
		return (value>>>amount) | (value<<(32 - amount));
	};
	
	var maxWord = 0x100000000;
	var lengthProperty = 'length', pushProperty = 'push';
	var i, j; // Used as a counter across the whole file
	var result = '';

	var words = [];
	var asciiLength = ascii[lengthProperty]*8, charCode;
	
	// Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
	// (we actually calculate the first 64, but extra values are just ignored)
	var hash = sha256.h = sha256.h || [];
	// Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
	var k = sha256.k = sha256.k || [];

	var primes = [], mathPow = Math.pow;
	var candidate = 2; // Our current candidate that we think might be a prime
	while (k[lengthProperty] < 64) {
		i = 0;
		while (i < primes[lengthProperty]) {
			if (!(candidate%primes[i++])) {
				// candidate is composite - increase the candidate and reset the prime-comparison counter
				i = 0;
				candidate++;
			}
		}
		hash[pushProperty]((mathPow(candidate, .5)*maxWord)|0);
		k[pushProperty]((mathPow(candidate, 1/3)*maxWord)|0);
		primes[pushProperty](candidate++);
	}
	hash = hash.slice(0);
	
	ascii += '\x80'; // Append '1' bit (plus zero padding)
	while (ascii[lengthProperty]%64 - 56) ascii += '\x00'; // More zero padding
	while (ascii) {
		charCode = ascii.charCodeAt.bind(ascii);
		words[pushProperty](((charCode(0)*256 + charCode(1))*256 + charCode(2))*256 + charCode(3));
		ascii = ascii.substring(4);
	}
	words[pushProperty]((asciiLength/maxWord)|0);
	words[pushProperty](asciiLength|0)
	
	// process each chunk
	while (words[lengthProperty]) {
		var w = words.splice(0, 16); // The message is expanded into 64 words as part of the iteration
		var working = hash.slice(0);
		for (i = 0; i < 64; i++) {
			// Expand the message into 64 words
			// Used below if 
			var w15 = w[i - 15], w2 = w[i - 2];

			// Iterate
			var a = working[0], e = working[4];
			var temp1 = working[7]
				+ (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
				+ ((e&working[5])^((~e)&working[6])) // ch
				+ k[i]
				// Expand the message schedule if needed
				+ (w[i] = (i < 16) ? w[i] : (
						w[i - 16]
						+ (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3)) // s0
						+ w[i - 7]
						+ (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10)) // s1
					)|0
				);
			// This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
			var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
				+ ((a&working[1])^(a&working[2])^(working[1]&working[2])); // maj
			
			working = [(temp1 + temp2)|0].concat(working); // We don't bother trimming off the extra ones, they're harmless
			working[4] = (working[4] + temp1)|0;
		}
		
		for (i = 0; i < 8; i++) {
			hash[i] = (hash[i] + working[i])|0;
		}
	}
	
	for (i = 0; i < 8; i++) {
		for (j = 24; j >= 0; j -= 8) {
			var b = (hash[i]>>j)&255;
			result += ((b < 16) ? '0' : '') + b.toString(16);
		}
	}
	return result;
};
	
	return sha256;
});
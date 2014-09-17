(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof module !== 'undefined' && module.exports){
		module.exports = factory();
	} else {
		global.sha256 = factory();
	}
})(this, function () {
	function sha256(ascii) {
		var hex = function (byte) {
			byte = (byte&255).toString(16);
			return (0 + byte).substring(byte.length - 1);
		};
		var wordToHex = function (word) {
			return hex(word>>24) + hex(word>>16) + hex(word>>8) + hex(word);
		};
		var binary = function (word) {
			var result = '';
			for (var i = 0; i < 32; i++) {
				result += ((word>>(31 - i))&1) ? '1' : '0';
			}
			return result;
		}

		// Initialize hash values:
		// (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
		var hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
		// Initialize array of round constants:
		// (first 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311):
		var k = [
			0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
			0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
			0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
			0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
			0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
			0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
			0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
			0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
		];
		
		var words = [];
		var asciiLength = ascii.length*8;
		ascii += '\x80';
		while (ascii.length%64 - 56) ascii += '\x00';
		while (ascii) {
			var charCode = ascii.charCodeAt.bind(ascii);
			// TODO: alias charCodeAt?
			words.push(((charCode(0)*256 + charCode(1))*256 + charCode(2))*256 + charCode(3));
			ascii = ascii.substring(4);
		}
		var maxWord = 0xffffffff;
		words.push(asciiLength/(maxWord + 1)&maxWord);
		words.push(asciiLength&maxWord)
		
		// process each chunk
		while (words.length) {
			var w = words.splice(0, 16);
			// Right rotate
			var rightRotate = function(value, amount) {
				return (value>>>amount) | (value<<(32 - amount));
			};
			var wrap = function (value) {
				return value&maxWord; // TODO: replace all these with just value|0 ?
			}
			for (var i = 16; i < 64; i++) {
				var w15 = w[i - 15], w2 = w[i - 2];
				var s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3);
				var s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10);
				w[i] = wrap(w[i - 16] + s0 + w[i - 7] + s1);
			}
			
			var working = hash.slice(0);
			for (var i = 0; i < 64; i++) {
				var a = working[0], e = working[4];
				var s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
				var ch = (e&working[5])^((~e)&working[6]);
				var temp1 = wrap(working[7] + s1 + ch + k[i] + w[i]); // TODO: this wrap() seems unnecessary
				var s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
				var maj = (a&working[1])^(a&working[2])^(working[1]&working[2]);
				var temp2 = s0 + maj;
				
				working = [wrap(temp1 + temp2)].concat(working.slice(0, 7)); // this slice is probably not needed?
				working[4] = wrap(working[4] + temp1);
			}
			
			for (var i = 0; i < 8; i++) {
				hash[i] = wrap(hash[i] + working[i]);
			}
		}
		
		var hex = function (byte) {
			byte = (byte&255).toString(16);
			return (0 + byte).substring(byte.length - 1);
		};
		var wordToHex = function (word) {
			return hex(word>>24) + hex(word>>16) + hex(word>>8) + hex(word);
		};
		return hash.map(wordToHex).join('');
	}
	
	return sha256;
});
function sha256(ascii) {
	var maxWord = 0xffffffff;
	var lengthProperty = 'length';
	
	var rightRotate = function(value, amount) {
		return (value>>>amount) | (value<<(32 - amount));
	};
	function constants(N, root) {
		var primes = [], result = [];
		var candidate = 2;
		while (primes[lengthProperty] < N) {
			for (var i = 0; i < primes[lengthProperty]; i++) {
				if (!(candidate%primes[i])) {
					i = -1;
					candidate++;
				}
			}
			result.push((Math.pow(candidate, 1/root)*(maxWord+1))|0);
			primes.push(candidate++);
		}
		return result;
	}
	// Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
	var hash = (sha256.h = sha256.h || constants(8, 2)).slice(0);
	// Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
	var k = (sha256.k = sha256.k || constants(64, 3));
	
	var words = [];
	var asciiLength = ascii[lengthProperty]*8;
	ascii += '\x80'; // Append '1' bit (plus zero padding)
	while (ascii[lengthProperty]%64 - 56) ascii += '\x00'; // More zero padding
	while (ascii) {
		var charCode = ascii.charCodeAt.bind(ascii);
		words.push(((charCode(0)*256 + charCode(1))*256 + charCode(2))*256 + charCode(3));
		ascii = ascii.substring(4);
	}
	words.push((asciiLength/(maxWord + 1))&maxWord);
	words.push(asciiLength&maxWord)
	
	// process each chunk
	while (words[lengthProperty]) {
		var w = words.splice(0, 16);
		// Expand the message into 64 words
		for (var i = 16; i < 64; i++) {
			var w15 = w[i - 15], w2 = w[i - 2];
			var s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15>>>3);
			var s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2>>>10);
			w[i] = (w[i - 16] + s0 + w[i - 7] + s1)|0;
		}
		
		var working = hash.slice(0);
		for (var i = 0; i < 64; i++) {
			var a = working[0], e = working[4];
			var s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
			var ch = (e&working[5])^((~e)&working[6]);
			var temp1 = working[7] + s1 + ch + k[i] + w[i]
			var s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
			var maj = (a&working[1])^(a&working[2])^(working[1]&working[2]);
			var temp2 = s0 + maj;
			
			working = [(temp1 + temp2)|0].concat(working); // We don't bother trimming off the extra ones, they're harmless
			working[4] = (working[4] + temp1)|0;
		}
		
		for (var i = 0; i < 8; i++) {
			hash[i] = (hash[i] + working[i])|0;
		}
	}
	
	var result = '';
	for (var i = 0; i < hash[lengthProperty]; i++) {
		for (var j = 24; j >= 0; j -= 8) {
			var b = (hash[i]>>j)&255;
			result += ((b < 16) ? '0' : '') + b.toString(16);
		}
	}
	return result;
}
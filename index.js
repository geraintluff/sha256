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
	
	var mathPow = Math.pow;
	var maxWord = mathPow(2, 32);
	var lengthProperty = 'length', pushProperty = 'push';
	var i, j; // Used as a counter across the whole file
	var result = '';

	var words = [];
	var asciiBitLength = ascii[lengthProperty]*8;
	
	//* caching results is optional - remove/add slash from front of this line to toggle
	// Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
	// (we actually calculate the first 64, but extra values are just ignored)
	var hash = sha256.h = sha256.h || [];
	// Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
	var k = sha256.k = sha256.k || [];
	var primeCounter = k[lengthProperty];
	/*/
	var hash = [], k = [];
	var primeCounter = 0;
	//*/

	var isComposite = {};
	for (var candidate = 2; primeCounter < 64; candidate++) {
		if (!isComposite[candidate]) {
			for (i = 0; i < 313; i += candidate) {
				isComposite[i] = candidate;
			}
			hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
			k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
		}
	}
	
	ascii += '\x80'; // Append '1' bit (plus zero padding)
	while (ascii[lengthProperty]%64 - 56) ascii += '\x00'; // More zero padding
	for (i = 0; i < ascii[lengthProperty]; i++) {
		j = ascii.charCodeAt(i);
		if (j>>8) return; // ASCII check: only accept characters in range 0-255
		words[i>>2] |= j << ((3 - i)%4)*8;
	}
	words[pushProperty]((asciiBitLength/maxWord)|0);
	words[pushProperty](asciiBitLength)
	
	// process each chunk
	for (j = 0; j < words[lengthProperty];) {
		var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
		var oldHash = hash;
		// This is now the "working hash", often labelled as variables a...g
		// (we have to truncate as well, otherwise extra entries at the end accumulate
		hash = hash.slice(0, 8);
		
		for (i = 0; i < 64; i++) {
			var i2 = i + j;
			// Expand the message into 64 words
			// Used below if 
			var w15 = w[i - 15], w2 = w[i - 2];

			// Iterate
			var a = hash[0], e = hash[4];
			var temp1 = hash[7]
				+ (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
				+ ((e&hash[5])^((~e)&hash[6])) // ch
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
				+ ((a&hash[1])^(a&hash[2])^(hash[1]&hash[2])); // maj
			
			hash = [(temp1 + temp2)|0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
			hash[4] = (hash[4] + temp1)|0;
		}
		
		for (i = 0; i < 8; i++) {
			hash[i] = (hash[i] + oldHash[i])|0;
		}
	}
	
	for (i = 0; i < 8; i++) {
		for (j = 3; j + 1; j--) {
			var b = (hash[i]>>(j*8))&255;
			result += ((b < 16) ? 0 : '') + b.toString(16);
		}
	}
	return result;
};


sha256.code = "var sha256=function a(b){function c(a,b){return a>>>b|a<<32-b}for(var d,e,f=Math.pow,g=f(2,32),h=\"length\",i=\"push\",j=\"\",k=[],l=8*b[h],m=a.h=a.h||[],n=a.k=a.k||[],o=n[h],p={},q=2;64>o;q++)if(!p[q]){for(d=0;313>d;d+=q)p[d]=q;m[o]=f(q,.5)*g|0,n[o++]=f(q,1/3)*g|0}for(b+=\"\\x80\";b[h]%64-56;)b+=\"\\x00\";for(d=0;d<b[h];d++){if(e=b.charCodeAt(d),e>>8)return;k[d>>2]|=e<<(3-d)%4*8}for(k[i](l/g|0),k[i](l),e=0;e<k[h];){var r=k.slice(e,e+=16),s=m;for(m=m.slice(0,8),d=0;64>d;d++){var t=r[d-15],u=r[d-2],v=m[0],w=m[4],x=m[7]+(c(w,6)^c(w,11)^c(w,25))+(w&m[5]^~w&m[6])+n[d]+(r[d]=16>d?r[d]:r[d-16]+(c(t,7)^c(t,18)^t>>>3)+r[d-7]+(c(u,17)^c(u,19)^u>>>10)|0),y=(c(v,2)^c(v,13)^c(v,22))+(v&m[1]^v&m[2]^m[1]&m[2]);m=[x+y|0].concat(m),m[4]=m[4]+x|0}for(d=0;8>d;d++)m[d]=m[d]+s[d]|0}for(d=0;8>d;d++)for(e=3;e+1;e--){var z=m[d]>>8*e&255;j+=(16>z?0:\"\")+z.toString(16)}return j};";

return sha256;

});
'use strict';

var salt = process.env.SWAP_ID_SALT || "omgg2gktnxbai";
console.log("Salt is: " + salt);

module.exports = {
	salt: salt
}
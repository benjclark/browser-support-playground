const fs = require('fs');

const copyFileContents = async function (providedPath) {
	return await new Promise((resolve, reject) => {
		fs.readFile(providedPath, (err, fileContents) => {
			if (err) {
				return reject(err);
			}
			return resolve(fileContents);
		});
	});
};

module.exports = copyFileContents;

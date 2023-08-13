const dayjs = require('dayjs');
const logger = require('../src/server/logger');

/**
 * Formats given raw publication into a more friendly form to be consumed by
 * the view.
 *
 * It includes things like, formatting dates, authors names...
 *
 * @param {object} publication - publication almost as returned by backend.
 * @returns {object}
 */
function formatPublication(publication) {
	const formattedPublication = {
		...publication
	};
	formattedPublication.publicationDate = 'N/A';

	try {
		// dayjs() fallbacks to current date therefore publicationDate must be defined
		if (publication.publicationDate) {
			const pubDate = dayjs(publication.publicationDate).format('MMMM YYYY');
			formattedPublication.publicationDate = pubDate;
		}
	} catch (error) {
		error.message = `Cannot format publication date for publication ${publication.id}: ${error.message} because of error: ${error.message}`;
		logger.log('error', error);
	}

	return formattedPublication;
}
module.exports = {
	formatPublication
};

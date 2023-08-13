const publications = require('./3-most-recent-publications.json');

const [pub1, pub2, pub3] = publications.data.publications;
pub1.publicationDate = pub1.publicationDate.replace('2020', ((new Date()).getFullYear() - 1).toString());
pub2.publicationDate = pub2.publicationDate.replace('2020', ((new Date()).getFullYear() - 2).toString());
pub3.publicationDate = pub3.publicationDate.replace('2020', ((new Date()).getFullYear() - 4).toString());

module.exports = publications;

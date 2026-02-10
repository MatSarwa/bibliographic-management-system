const CrossRefProvider = require('./crossref.provider');
const OpenLibraryProvider = require('./openlibrary.provider');
const ArxivProvider = require('./arxiv.provider');
const PubMedProvider = require('./pubmed.provider');

module.exports = {
  crossref: CrossRefProvider,
  openlibrary: OpenLibraryProvider,
  arxiv: ArxivProvider,
  pubmed: PubMedProvider,
};
module.exports = {
  crossref: {
    baseURL: 'https://api.crossref.org/works',
    rateLimit: 50,
    timeout: 10000
  },

  openlibrary: {
    baseURL: 'https://openlibrary.org/api',
    rateLimit: 100,
    timeout: 8000
  },

  arxiv: {
    baseURL: 'http://export.arxiv.org/api',
    rateLimit: 3,
    timeout: 10000
  },

  pubmed: {
    baseURL: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
    apiKey: process.env.PUBMED_API_KEY || '',
    rateLimit: 3,
    timeout: 10000
  },

  identifierProviders: {
    doi: ['crossref'],
    isbn: ['openlibrary'],
    pmid: ['pubmed'],
    arxiv: ['arxiv']
  },

  cache: {
    ttl: 3600,
    maxSize: 1000
  }
};
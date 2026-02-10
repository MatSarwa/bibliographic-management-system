const BaseProvider = require('./base.provider');

class CrossRefProvider extends BaseProvider {
  constructor(config) {
    super('crossref', config);
    this.baseURL = config.baseURL;
  }

  async fetchByDOI(doi) {
    try {
      await this.rateLimit();
      console.log(`[CrossRef] Fetching DOI: ${doi}`);

      const response = await this.client.get(`${this.baseURL}/${doi}`);
      return this.normalize(response.data.message);
    } catch (error) {
      this.handleError(error, `fetchByDOI(${doi})`);
    }
  }

  async fetchByISBN(isbn) {
    try {
      await this.rateLimit();
      console.log(`[CrossRef] Fetching ISBN: ${isbn}`);

      const response = await this.client.get(`${this.baseURL}`, {
        params: { filter: `isbn:${isbn}`, rows: 1 }
      });

      const items = response.data.message.items || [];
      if (items.length === 0) {
        throw new Error(`No results for ISBN ${isbn}`);
      }

      return this.normalize(items[0]);
    } catch (error) {
      this.handleError(error, `fetchByISBN(${isbn})`);
    }
  }

  async search(query, options = {}) {
    try {
      await this.rateLimit();
      console.log(`[CrossRef] Searching: "${query}"`);

      const response = await this.client.get(`${this.baseURL}`, {
        params: {
          query,
          rows: options.limit || 20,
          offset: options.offset || 0
        }
      });

      const items = response.data.message.items || [];
      return items.map(item => this.normalize(item));
    } catch (error) {
      this.handleError(error, `search(${query})`);
    }
  }

  normalize(data) {
    const authors = (data.author || []).map(author => ({
      firstName: author.given || '',
      lastName: author.family || '',
      fullName: `${author.given || ''} ${author.family || ''}`.trim()
    }));

    const year = data.published?.['date-parts']?.[0]?.[0] || 
                 data['published-print']?.['date-parts']?.[0]?.[0];

    const title = Array.isArray(data.title) ? data.title[0] : data.title;
    const journal = Array.isArray(data['container-title']) 
      ? data['container-title'][0] 
      : data['container-title'];

    return {
      title: this.cleanTitle(title),
      itemType: this.mapType(data.type),
      year,
      metadata: {
        authors,
        doi: data.DOI || '',
        isbn: data.ISBN?.[0] || '',
        journal: journal || '',
        publisher: data.publisher || '',
        volume: data.volume || '',
        issue: data.issue || '',
        pages: data.page || '',
        abstract: data.abstract?.replace(/<[^>]*>/g, '') || '',
        url: data.URL || ''
      },
      source: 'crossref'
    };
  }

  mapType(crossrefType) {
    const typeMap = {
      'journal-article': 'article',
      'book': 'book',
      'book-chapter': 'chapter',
      'proceedings-article': 'conference'
    };
    return typeMap[crossrefType] || 'article';
  }
}

module.exports = CrossRefProvider;
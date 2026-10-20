const BaseProvider = require('./base.provider');

class OpenLibraryProvider extends BaseProvider {
  constructor(config) {
    super('openlibrary', config);
    this.baseURL = config.baseURL;
  }

  async fetchByISBN(isbn) {
    try {
      await this.rateLimit();

      const response = await this.client.get(`${this.baseURL}/books`, {
        params: {
          bibkeys: `ISBN:${isbn}`,
          format: 'json',
          jscmd: 'data'
        }
      });

      const key = `ISBN:${isbn}`;
      const data = response.data[key];

      if (!data) {
        throw new Error(`ISBN not found: ${isbn}`);
      }

      return this.normalize(data, isbn);
    } catch (error) {
      this.handleError(error, `fetchByISBN(${isbn})`);
    }
  }

  async fetchById(id) {

    return this.fetchByISBN(id);
  }

  async search(query, options = {}) {
    try {
      await this.rateLimit();

      const response = await this.client.get('https://openlibrary.org/search.json', {
        params: {
          q: query,
          limit: options.limit || 20
        }
      });

      const docs = response.data.docs || [];
      return docs.map(doc => this.normalizeSearch(doc));
    } catch (error) {
      this.handleError(error, `search(${query})`);
    }
  }

  normalize(data, isbn) {
    const authors = (data.authors || []).map(author => ({
      firstName: '',
      lastName: author.name || '',
      fullName: author.name || ''
    }));

    return {
      title: this.cleanTitle(data.title),
      itemType: 'book',
      year: data.publish_date ? this.extractYear(data.publish_date) : null,
      metadata: {
        authors,
        isbn: isbn,
        publisher: data.publishers?.[0]?.name || '',
        pages: data.number_of_pages || '',
        abstract: data.notes || '',
        url: data.url || `https://openlibrary.org/isbn/${isbn}`
      },
      source: 'openlibrary'
    };
  }

  normalizeSearch(doc) {
    const authors = (doc.author_name || []).map(name => ({
      firstName: '',
      lastName: name,
      fullName: name
    }));

    return {
      title: this.cleanTitle(doc.title),
      itemType: 'book',
      year: doc.first_publish_year || null,
      metadata: {
        authors,
        isbn: doc.isbn?.[0] || '',
        publisher: doc.publisher?.[0] || '',
        pages: doc.number_of_pages_median || ''
      },
      source: 'openlibrary'
    };
  }
}

module.exports = OpenLibraryProvider;
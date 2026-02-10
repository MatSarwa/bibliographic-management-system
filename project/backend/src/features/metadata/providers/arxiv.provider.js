const BaseProvider = require('./base.provider');
const xml2js = require('xml2js');

class ArxivProvider extends BaseProvider {
  constructor(config) {
    super('arxiv', config);
    this.baseURL = config.baseURL;
    this.parser = new xml2js.Parser();
  }

  async fetchById(arxivId) {
    try {
      await this.rateLimit();
      console.log(`[arXiv] Fetching ID: ${arxivId}`);

      const response = await this.client.get(`${this.baseURL}/query`, {
        params: { id_list: arxivId }
      });

      const parsed = await this.parser.parseStringPromise(response.data);
      const entry = parsed.feed?.entry?.[0];

      if (!entry) {
        throw new Error(`arXiv ID not found: ${arxivId}`);
      }

      return this.normalize(entry);
    } catch (error) {
      this.handleError(error, `fetchById(${arxivId})`);
    }
  }

  async search(query, options = {}) {
    try {
      await this.rateLimit();
      console.log(`[arXiv] Searching: "${query}"`);

      const response = await this.client.get(`${this.baseURL}/query`, {
        params: {
          search_query: `all:${query}`,
          start: options.offset || 0,
          max_results: options.limit || 20
        }
      });

      const parsed = await this.parser.parseStringPromise(response.data);
      const entries = parsed.feed?.entry || [];
      const entriesArray = Array.isArray(entries) ? entries : [entries];

      return entriesArray.filter(e => e).map(e => this.normalize(e));
    } catch (error) {
      this.handleError(error, `search(${query})`);
    }
  }

  normalize(entry) {
    const arxivId = entry.id[0].split('/abs/')[1];
    
    const authors = (entry.author || []).map(a => 
      this.parseAuthorName(a.name[0])
    );

    return {
      title: this.cleanTitle(entry.title[0]),
      itemType: 'article',
      year: this.extractYear(entry.published[0]),
      metadata: {
        authors,
        arxivId: arxivId,
        abstract: entry.summary?.[0]?.replace(/\n/g, ' ').trim() || '',
        url: `https://arxiv.org/abs/${arxivId}`,
        pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`
      },
      source: 'arxiv'
    };
  }
}

module.exports = ArxivProvider;
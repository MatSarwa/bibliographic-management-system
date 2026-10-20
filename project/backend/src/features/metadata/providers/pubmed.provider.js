const BaseProvider = require('./base.provider');
const xml2js = require('xml2js');

class PubMedProvider extends BaseProvider {
  constructor(config) {
    super('pubmed', config);
    this.baseURL = config.baseURL;
    this.parser = new xml2js.Parser({ explicitArray: false });
  }

  async fetchById(pmid) {
    try {
      await this.rateLimit();

      const params = {
        db: 'pubmed',
        id: pmid,
        retmode: 'xml'
      };

      if (this.config.apiKey) {
        params.api_key = this.config.apiKey;
      }

      const response = await this.client.get(`${this.baseURL}/efetch.fcgi`, { params });
      const parsed = await this.parser.parseStringPromise(response.data);
      
      const article = parsed.PubmedArticleSet?.PubmedArticle;
      if (!article) {
        throw new Error('Article not found');
      }

      return this.normalize(article);
    } catch (error) {
      this.handleError(error, `fetchById(${pmid})`);
    }
  }

  async search(query, options = {}) {
    try {
      await this.rateLimit();

      const searchParams = {
        db: 'pubmed',
        term: query,
        retmax: options.limit || 20,
        retstart: options.offset || 0,
        retmode: 'json'
      };

      if (this.config.apiKey) {
        searchParams.api_key = this.config.apiKey;
      }

      const searchResponse = await this.client.get(`${this.baseURL}/esearch.fcgi`, { 
        params: searchParams 
      });

      const ids = searchResponse.data.esearchresult?.idlist || [];
      if (ids.length === 0) return [];

      const fetchParams = {
        db: 'pubmed',
        id: ids.join(','),
        retmode: 'xml'
      };

      if (this.config.apiKey) {
        fetchParams.api_key = this.config.apiKey;
      }

      const fetchResponse = await this.client.get(`${this.baseURL}/efetch.fcgi`, { 
        params: fetchParams 
      });

      const parsed = await this.parser.parseStringPromise(fetchResponse.data);
      const articles = Array.isArray(parsed.PubmedArticleSet?.PubmedArticle)
        ? parsed.PubmedArticleSet.PubmedArticle
        : [parsed.PubmedArticleSet?.PubmedArticle].filter(Boolean);

      return articles.map(article => this.normalize(article));
    } catch (error) {
      this.handleError(error, `search(${query})`);
    }
  }

  normalize(article) {
    const medline = article.MedlineCitation;
    const articleData = medline.Article;

    const authorList = articleData.AuthorList?.Author;
    const authors = (Array.isArray(authorList) ? authorList : [authorList])
      .filter(Boolean)
      .map(author => ({
        firstName: author.ForeName || '',
        lastName: author.LastName || '',
        fullName: `${author.ForeName || ''} ${author.LastName || ''}`.trim()
      }));

    const year = this.extractPubMedYear(medline, articleData);

    const pmid = typeof medline.PMID === 'string' ? medline.PMID : 
                 typeof medline.PMID === 'object' ? medline.PMID._ : '';

    return {
      title: this.cleanTitle(articleData.ArticleTitle),
      itemType: 'article',
      year,
      metadata: {
        authors,
        pmid,
        journal: articleData.Journal?.Title || '',
        volume: articleData.Journal?.JournalIssue?.Volume || '',
        issue: articleData.Journal?.JournalIssue?.Issue || '',
        pages: articleData.Pagination?.MedlinePgn || '',
        abstract: this.extractAbstract(articleData.Abstract),
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
      },
      source: 'pubmed'
    };
  }

  extractPubMedYear(medline, articleData) {
    if (articleData.Journal?.JournalIssue?.PubDate?.Year) {
      return parseInt(articleData.Journal.JournalIssue.PubDate.Year);
    }
    
    if (medline.DateCompleted?.Year) {
      return parseInt(medline.DateCompleted.Year);
    }
    
    return null;
  }

  extractAbstract(abstractData) {
    if (!abstractData) return '';
    
    const text = abstractData.AbstractText;
    if (!text) return '';
    
    if (typeof text === 'string') return text;
    if (Array.isArray(text)) return text.join(' ');
    if (text._) return text._;
    
    return '';
  }
}

module.exports = PubMedProvider;
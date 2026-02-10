const axios = require('axios');

class BaseProvider {
  constructor(name, config) {
    this.name = name;
    this.config = config;
    
    this.client = axios.create({
      timeout: config.timeout || 10000,
      headers: {
        'User-Agent': `BibliographyApp/1.0`,
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
        ...(config.headers || {})
      }
    });

    this.lastRequestTime = 0;
    this.minRequestInterval = 1000 / (config.rateLimit || 10);
  }

  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  async fetchByDOI(doi) {
    throw new Error(`${this.name}: fetchByDOI() not implemented`);
  }

  async fetchByISBN(isbn) {
    throw new Error(`${this.name}: fetchByISBN() not implemented`);
  }

  async fetchById(id) {
    throw new Error(`${this.name}: fetchById() not implemented`);
  }

  async search(query, options = {}) {
    throw new Error(`${this.name}: search() not implemented`);
  }

  extractYear(dateInput) {
    if (!dateInput) return null;
    
    if (typeof dateInput === 'object' && dateInput.Year) {
      return parseInt(dateInput.Year);
    }
    
    const dateString = String(dateInput);
    const yearMatch = dateString.match(/\d{4}/);
    return yearMatch ? parseInt(yearMatch[0]) : null;
  }

  cleanTitle(title) {
    if (!title) return '';
    return title.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  parseAuthorName(authorString) {
    if (!authorString) return { firstName: '', lastName: '', fullName: '' };

    if (authorString.includes(',')) {
      const [lastName, firstName] = authorString.split(',').map(s => s.trim());
      return { 
        firstName, 
        lastName,
        fullName: `${firstName} ${lastName}`.trim()
      };
    }

    const parts = authorString.trim().split(/\s+/);
    const lastName = parts[parts.length - 1];
    const firstName = parts.slice(0, -1).join(' ');
    
    return { 
      firstName, 
      lastName,
      fullName: `${firstName} ${lastName}`.trim()
    };
  }

  handleError(error, context = '') {
    console.error(`[${this.name}] Error in ${context}:`, error.message);
    throw new Error(`${this.name}: ${error.message}`);
  }
}

module.exports = BaseProvider;
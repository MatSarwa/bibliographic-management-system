const validator = require('validator');

class IdentifierDetector {
  
  detect(input) {
    if (!input || typeof input !== 'string') {
      return { type: null, value: null, isValid: false };
    }

    const cleaned = input.trim();

    const detectors = [
      this.detectDOI,
      this.detectArxiv,
      this.detectBibcode,
      this.detectPMID,
      this.detectPMCID,
      this.detectISBN,
      this.detectOpenAlexId
    ];

    for (const detector of detectors) {
      const result = detector.call(this, cleaned);
      if (result.isValid) {
        return result;
      }
    }

    return {
      type: 'query',
      value: cleaned,
      isValid: true
    };
  }

  detectDOI(input) {
    let doi = input.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
    doi = doi.replace(/^doi:\s*/i, '');

    const doiRegex = /^10\.\d{4,}(\.\d+)*\/\S+$/;
    
    if (doiRegex.test(doi)) {
      return {
        type: 'doi',
        value: doi.toLowerCase(),
        isValid: true,
        displayValue: doi,
        providers: ['crossref', 'openalex']
      };
    }

    return { type: 'doi', value: null, isValid: false };
  }

  detectISBN(input) {
    let isbn = input.replace(/^isbn:?\s*/i, '');
    isbn = isbn.replace(/[-\s]/g, '');

    if (validator.isISBN(isbn)) {
      const normalized = validator.isISBN(isbn, 13) ? isbn : this.isbn10to13(isbn);
      
      return {
        type: 'isbn',
        value: normalized,
        isValid: true,
        displayValue: this.formatISBN(normalized),
        providers: ['openlibrary', 'openalex']
      };
    }

    return { type: 'isbn', value: null, isValid: false };
  }

  detectPMID(input) {
    let pmid = input.replace(/^pmid:?\s*/i, '');
    pmid = pmid.trim();

    const pmidRegex = /^\d{1,8}$/;
    
    if (pmidRegex.test(pmid) && (input.toLowerCase().includes('pmid') || /^\d+$/.test(input))) {
      return {
        type: 'pmid',
        value: pmid,
        isValid: true,
        displayValue: `PMID:${pmid}`,
        providers: ['pubmed']
      };
    }

    return { type: 'pmid', value: null, isValid: false };
  }

  detectPMCID(input) {
    const pmcidRegex = /^PMC\d{1,8}$/i;
    
    if (pmcidRegex.test(input)) {
      return {
        type: 'pmcid',
        value: input.toUpperCase(),
        isValid: true,
        displayValue: input.toUpperCase(),
        providers: ['pubmed']
      };
    }

    return { type: 'pmcid', value: null, isValid: false };
  }

  detectArxiv(input) {
    let arxiv = input.replace(/^arxiv:?\s*/i, '');
    arxiv = arxiv.replace(/^https?:\/\/arxiv\.org\/(abs|pdf)\//i, '');
    arxiv = arxiv.replace(/\.pdf$/i, '');

    const newFormat = /^\d{4}\.\d{4,5}(v\d+)?$/;
    const oldFormat = /^[a-z\-]+\/\d{7}$/;

    if (newFormat.test(arxiv) || oldFormat.test(arxiv)) {
      return {
        type: 'arxiv',
        value: arxiv,
        isValid: true,
        displayValue: `arXiv:${arxiv}`,
        providers: ['arxiv', 'openalex']
      };
    }

    return { type: 'arxiv', value: null, isValid: false };
  }

  detectBibcode(input) {
    if (input.length < 19) {
      return { type: 'bibcode', value: null, isValid: false };
    }

    if (!/^[12]\d{3}/.test(input)) {
      return { type: 'bibcode', value: null, isValid: false };
    }

    if (!input.includes('.')) {
      return { type: 'bibcode', value: null, isValid: false };
    }

    const bibcodeRegex = /^[12]\d{3}[A-Za-z&]{3,}[\.\d]+[A-Za-z\d]*[A-Z]?$/;
    
    if (bibcodeRegex.test(input)) {
      return {
        type: 'bibcode',
        value: input,
        isValid: true,
        displayValue: input,
        providers: ['ads']  
      };
    }

    return { type: 'bibcode', value: null, isValid: false };
  }

  detectOpenAlexId(input) {
    let id = input.replace(/^https?:\/\/openalex\.org\//i, '');
    
    const openalexRegex = /^[WAICVPFS]\d{8,10}$/;
    
    if (openalexRegex.test(id)) {
      return {
        type: 'openalex_id',
        value: id,
        isValid: true,
        displayValue: id,
        providers: ['openalex']
      };
    }

    return { type: 'openalex_id', value: null, isValid: false };
  }

  isbn10to13(isbn10) {
    if (isbn10.length !== 10) return isbn10;
    
    let isbn13 = '978' + isbn10.slice(0, 9);
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(isbn13[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checksum = (10 - (sum % 10)) % 10;
    
    return isbn13 + checksum;
  }

  formatISBN(isbn) {
    if (isbn.length === 13) {
      return `${isbn.slice(0, 3)}-${isbn.slice(3, 4)}-${isbn.slice(4, 9)}-${isbn.slice(9, 12)}-${isbn.slice(12)}`;
    } else if (isbn.length === 10) {
      return `${isbn.slice(0, 1)}-${isbn.slice(1, 5)}-${isbn.slice(5, 9)}-${isbn.slice(9)}`;
    }
    return isbn;
  }

  detectBatch(inputs) {
    return inputs.map(input => this.detect(input));
  }
}

module.exports = new IdentifierDetector();
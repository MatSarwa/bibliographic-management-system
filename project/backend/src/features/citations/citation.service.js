class CitationService {
  
  static STYLES = {
    'apa': { name: 'APA 7th', desc: 'Psychologia, Nauki społeczne' },
    'mla': { name: 'MLA 9th', desc: 'Literatura, Humanistyka' },
    'chicago': { name: 'Chicago', desc: 'Historia, Sztuka' },
    'harvard': { name: 'Harvard', desc: 'Ogólny akademicki' },
    'ieee': { name: 'IEEE', desc: 'Inżynieria, IT' },
    'vancouver': { name: 'Vancouver', desc: 'Medycyna, Biologia' }
  };

  parseAuthors(item) {
    const metadata = item.metadata || {};
    let authors = [];

    if (metadata.authors && Array.isArray(metadata.authors)) {
      authors = metadata.authors;
    } else if (item.authors && Array.isArray(item.authors)) {
      authors = item.authors;
    } else if (item.author && typeof item.author === 'string') {
      authors = item.author.split(/;|and/i).map(a => a.trim()).filter(Boolean);
    }

    return authors.map(author => {
      if (typeof author === 'string') {
        const trimmed = author.trim();
        
        if (trimmed.includes(',')) {
          const parts = trimmed.split(',').map(s => s.trim());
          const family = parts[0] || ''; 
          const given = parts[1] || '';   
          return { given, family };
        }
        
        const parts = trimmed.split(' ').filter(Boolean);
        if (parts.length === 1) {
          return { given: '', family: parts[0] };
        }
        return {
          given: parts.slice(0, -1).join(' '), 
          family: parts[parts.length - 1]      
        };
      }
      
      if (typeof author === 'object') {
        if (author.fullName) {
          const name = author.fullName.trim();
          if (name.includes(',')) {
            const parts = name.split(',').map(s => s.trim());
            return { given: parts[1] || '', family: parts[0] || '' };
          }
          const parts = name.split(' ').filter(Boolean);
          return {
            given: parts.slice(0, -1).join(' ') || '',
            family: parts[parts.length - 1] || ''
          };
        }
        
        return {
          given: author.firstName || author.given || '',
          family: author.lastName || author.family || ''
        };
      }

      return { given: '', family: 'Unknown' };
    }).filter(a => a.family || a.given);
  }

  extractData(item) {
    const metadata = item.metadata || {};
    
    return {
      authors: this.parseAuthors(item),
      title: item.title || 'Untitled',
      year: item.year || metadata.year || 'n.d.',
      journal: item.journal || metadata.journal || metadata.conference || '',
      volume: item.volume || metadata.volume || '',
      issue: item.issue || metadata.issue || '',
      pages: item.pages || metadata.pages || '',
      publisher: item.publisher || metadata.publisher || '',
      doi: item.doi || metadata.doi || '',
      url: item.url || metadata.url || '',
      isbn: item.isbn || metadata.isbn || ''
    };
  }

  getInitials(given) {
    if (!given) return '';
    return given.split(' ').map(n => n.charAt(0) + '.').join(' ');
  }

  formatAPA(data) {
    const { authors, title, year, journal, volume, issue, pages, doi } = data;
    
    let authorStr = '';
    if (authors.length === 1) {
      const a = authors[0];
      authorStr = `${a.family}, ${this.getInitials(a.given)}`;
    } else if (authors.length === 2) {
      authorStr = authors.map(a => `${a.family}, ${this.getInitials(a.given)}`).join(', & ');
    } else if (authors.length > 2) {
      const first = authors[0];
      authorStr = `${first.family}, ${this.getInitials(first.given)}, et al.`;
    }

    let citation = `${authorStr} (${year}). ${title}.`;
    
    if (journal) {
      citation += ` *${journal}*`;
      if (volume) citation += `, *${volume}*`;
      if (issue) citation += `(${issue})`;
      if (pages) citation += `, ${pages}`;
      citation += '.';
    }
    
    if (doi) citation += ` https://doi.org/${doi}`;

    return citation;
  }

  formatMLA(data) {
    const { authors, title, year, journal, volume, issue, pages } = data;
    
    let authorStr = '';
    if (authors.length === 1) {
      const a = authors[0];
      authorStr = `${a.family}, ${a.given}`;
    } else if (authors.length === 2) {
      authorStr = `${authors[0].family}, ${authors[0].given}, and ${authors[1].given} ${authors[1].family}`;
    } else if (authors.length > 2) {
      authorStr = `${authors[0].family}, ${authors[0].given}, et al.`;
    }

    let citation = `${authorStr}. "${title}."`;
    
    if (journal) {
      citation += ` *${journal}*`;
      if (volume) citation += `, vol. ${volume}`;
      if (issue) citation += `, no. ${issue}`;
      citation += `, ${year}`;
      if (pages) citation += `, pp. ${pages}`;
      citation += '.';
    } else {
      citation += ` ${year}.`;
    }

    return citation;
  }

  formatChicago(data) {
    const { authors, title, year, journal, volume, issue, pages, doi } = data;
    
    let authorStr = '';
    if (authors.length === 1) {
      const a = authors[0];
      authorStr = `${a.family}, ${a.given}`;
    } else if (authors.length === 2) {
      authorStr = `${authors[0].family}, ${authors[0].given}, and ${authors[1].given} ${authors[1].family}`;
    } else if (authors.length > 2) {
      authorStr = `${authors[0].family}, ${authors[0].given}, et al.`;
    }

    let citation = `${authorStr}. ${year}. "${title}."`;
    
    if (journal) {
      citation += ` *${journal}*`;
      if (volume) citation += ` ${volume}`;
      if (issue) citation += ` (${issue})`;
      if (pages) citation += `: ${pages}`;
      citation += '.';
    }
    
    if (doi) citation += ` https://doi.org/${doi}`;

    return citation;
  }

  formatHarvard(data) {
    const { authors, title, year, journal, volume, issue, pages, doi } = data;
    
    let authorStr = '';
    if (authors.length === 1) {
      const a = authors[0];
      authorStr = `${a.family}, ${this.getInitials(a.given).replace(/ /g, '')}`;
    } else if (authors.length === 2) {
      authorStr = authors.map(a => `${a.family}, ${this.getInitials(a.given).replace(/ /g, '')}`).join(' and ');
    } else if (authors.length > 2) {
      const first = authors[0];
      authorStr = `${first.family}, ${this.getInitials(first.given).replace(/ /g, '')} et al.`;
    }

    let citation = `${authorStr} (${year}) '${title}'`;
    
    if (journal) {
      citation += `, *${journal}*`;
      if (volume) citation += `, ${volume}`;
      if (issue) citation += `(${issue})`;
      if (pages) citation += `, pp. ${pages}`;
    }
    citation += '.';
    
    if (doi) citation += ` doi: ${doi}`;

    return citation;
  }

  formatIEEE(data) {
    const { authors, title, year, journal, volume, issue, pages, doi } = data;
    
    const authorStr = authors.map(a => {
      const initials = this.getInitials(a.given);
      return `${initials} ${a.family}`.trim();
    }).join(' and ');

    let citation = `${authorStr}, "${title},"`;
    
    if (journal) {
      citation += ` *${journal}*`;
      if (volume) citation += `, vol. ${volume}`;
      if (issue) citation += `, no. ${issue}`;
      if (pages) citation += `, pp. ${pages}`;
    }
    citation += `, ${year}.`;
    
    if (doi) citation += ` doi: ${doi}`;

    return citation;
  }

  formatVancouver(data) {
    const { authors, title, year, journal, volume, issue, pages, doi } = data;
    
    const authorStr = authors.map(a => {
      const initials = a.given ? a.given.split(' ').map(n => n.charAt(0)).join('') : '';
      return `${a.family} ${initials}`.trim();
    }).join(', ');

    let citation = `${authorStr}. ${title}.`;
    
    if (journal) {
      citation += ` ${journal}. ${year}`;
      if (volume) citation += `;${volume}`;
      if (issue) citation += `(${issue})`;
      if (pages) citation += `:${pages}`;
      citation += '.';
    } else {
      citation += ` ${year}.`;
    }
    
    if (doi) citation += ` doi: ${doi}`;

    return citation;
  }

  generateCitation(item, styleCode = 'apa') {
    const style = CitationService.STYLES[styleCode];
    if (!style) {
      throw new Error('Nieznany styl cytowania');
    }

    const data = this.extractData(item);
    
    switch (styleCode) {
      case 'apa': return this.formatAPA(data);
      case 'mla': return this.formatMLA(data);
      case 'chicago': return this.formatChicago(data);
      case 'harvard': return this.formatHarvard(data);
      case 'ieee': return this.formatIEEE(data);
      case 'vancouver': return this.formatVancouver(data);
      default: return this.formatAPA(data);
    }
  }

  getStyles() {
    return Object.entries(CitationService.STYLES).map(([code, data]) => ({
      code,
      name: data.name,
      description: data.desc
    }));
  }
}

module.exports = new CitationService();
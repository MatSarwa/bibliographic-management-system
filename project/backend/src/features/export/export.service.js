const { Item, Label, Collection } = require('../../models');

class ExportService {

  generateBibTeX(items) {
    if (!Array.isArray(items)) {
      items = [items];
    }

    const entries = items.map(item => this.itemToBibTeX(item));
    return entries.join('\n\n');
  }

  itemToBibTeX(item) {
    const metadata = item.metadata || {};
    const authors = metadata.authors || [];
    
    const citationKey = this.generateCitationKey(item);

    const bibType = this.mapItemTypeToBibTeX(item.itemType);

    let entry = `@${bibType}{${citationKey},\n`;

    entry += `  title = {${this.escapeBibTeX(item.title)}},\n`;

    if (authors.length > 0) {
      const authorString = authors
        .map(a => a.fullName || `${a.firstName} ${a.lastName}`.trim())
        .join(' and ');
      entry += `  author = {${this.escapeBibTeX(authorString)}},\n`;
    }

    if (item.year) {
      entry += `  year = {${item.year}},\n`;
    }

    if (bibType === 'article') {
      if (metadata.journal) entry += `  journal = {${this.escapeBibTeX(metadata.journal)}},\n`;
      if (metadata.volume) entry += `  volume = {${metadata.volume}},\n`;
      if (metadata.issue) entry += `  number = {${metadata.issue}},\n`;
      if (metadata.pages) entry += `  pages = {${metadata.pages}},\n`;
    }

    if (bibType === 'book' || bibType === 'inbook') {
      if (metadata.publisher) entry += `  publisher = {${this.escapeBibTeX(metadata.publisher)}},\n`;
      if (metadata.isbn) entry += `  isbn = {${metadata.isbn}},\n`;
    }

    if (bibType === 'inproceedings') {
      if (metadata.booktitle) entry += `  booktitle = {${this.escapeBibTeX(metadata.booktitle)}},\n`;
    }

    if (metadata.doi) {
      entry += `  doi = {${metadata.doi}},\n`;
    }

    if (metadata.url) {
      entry += `  url = {${metadata.url}},\n`;
    }

    if (metadata.abstract) {
      entry += `  abstract = {${this.escapeBibTeX(metadata.abstract)}},\n`;
    }

    entry = entry.replace(/,\n$/, '\n');
    entry += '}';

    return entry;
  }

  generateRIS(items) {
    if (!Array.isArray(items)) {
      items = [items];
    }

    const entries = items.map(item => this.itemToRIS(item));
    return entries.join('\n\n');
  }

  itemToRIS(item) {
    const metadata = item.metadata || {};
    const authors = metadata.authors || [];

    let entry = '';

    const risType = this.mapItemTypeToRIS(item.itemType);
    entry += `TY  - ${risType}\n`;

    authors.forEach(author => {
      const authorName = author.fullName || `${author.firstName} ${author.lastName}`.trim();
      entry += `AU  - ${authorName}\n`;
    });

    entry += `TI  - ${item.title}\n`;

    if (item.year) {
      entry += `PY  - ${item.year}\n`;
    }

    if (item.itemType === 'article') {
      if (metadata.journal) entry += `JO  - ${metadata.journal}\n`;
      if (metadata.volume) entry += `VL  - ${metadata.volume}\n`;
      if (metadata.issue) entry += `IS  - ${metadata.issue}\n`;
      if (metadata.pages) {
        const pages = metadata.pages.split('-');
        if (pages[0]) entry += `SP  - ${pages[0].trim()}\n`;
        if (pages[1]) entry += `EP  - ${pages[1].trim()}\n`;
      }
    }

    if (item.itemType === 'book') {
      if (metadata.publisher) entry += `PB  - ${metadata.publisher}\n`;
      if (metadata.isbn) entry += `SN  - ${metadata.isbn}\n`;
    }

    if (metadata.doi) {
      entry += `DO  - ${metadata.doi}\n`;
    }

    if (metadata.url) {
      entry += `UR  - ${metadata.url}\n`;
    }

    if (metadata.abstract) {
      entry += `AB  - ${metadata.abstract}\n`;
    }

    entry += 'ER  -';

    return entry;
  }

  async exportItem(userId, itemId, format) {
    const item = await Item.findOne({
      where: {
        id: itemId,
        userId,
        status: 'active'
      },
      include: [
        {
          model: Label,
          as: 'labels',
          through: { attributes: [] }
        }
      ]
    });

    if (!item) {
      throw new Error('Item nie znaleziony');
    }

    if (format === 'bibtex') {
      return this.generateBibTeX(item);
    } else if (format === 'ris') {
      return this.generateRIS(item);
    } else {
      throw new Error('Nieobsługiwany format');
    }
  }

  async exportMultipleItems(userId, itemIds, format) {
    const items = await Item.findAll({
      where: {
        id: itemIds,
        userId,
        status: 'active'
      },
      include: [
        {
          model: Label,
          as: 'labels',
          through: { attributes: [] }
        }
      ],
      order: [['dateAdded', 'DESC']]
    });

    if (items.length === 0) {
      throw new Error('Nie znaleziono itemów do eksportu');
    }

    if (format === 'bibtex') {
      return this.generateBibTeX(items);
    } else if (format === 'ris') {
      return this.generateRIS(items);
    } else {
      throw new Error('Nieobsługiwany format');
    }
  }

  async exportCollection(userId, collectionId, format) {

    const collection = await Collection.findOne({
      where: {
        id: collectionId,
        ownerId: userId
      }
    });

    if (!collection) {
      throw new Error('Kolekcja nie znaleziona');
    }

    const items = await Item.findAll({
      where: {
        userId,
        collectionId,
        status: 'active'
      },
      include: [
        {
          model: Label,
          as: 'labels',
          through: { attributes: [] }
        }
      ],
      order: [['dateAdded', 'DESC']]
    });

    if (items.length === 0) {
      throw new Error('Kolekcja jest pusta');
    }

    if (format === 'bibtex') {
      return this.generateBibTeX(items);
    } else if (format === 'ris') {
      return this.generateRIS(items);
    } else {
      throw new Error('Nieobsługiwany format');
    }
  }

  generateCitationKey(item) {
    const metadata = item.metadata || {};
    const authors = metadata.authors || [];

    let authorPart = 'unknown';
    if (authors.length > 0) {
      const firstAuthor = authors[0];
      authorPart = (firstAuthor.lastName || firstAuthor.fullName || 'unknown')
        .toLowerCase()
        .replace(/[^a-z]/g, '');
    }

    const yearPart = item.year || 'nodate';

    return `${authorPart}${yearPart}`;
  }

  mapItemTypeToBibTeX(itemType) {
    const typeMap = {
      'article': 'article',
      'book': 'book',
      'chapter': 'inbook',
      'conference': 'inproceedings',
      'thesis': 'phdthesis'
    };
    return typeMap[itemType] || 'misc';
  }

  mapItemTypeToRIS(itemType) {
    const typeMap = {
      'article': 'JOUR',
      'book': 'BOOK',
      'chapter': 'CHAP',
      'conference': 'CONF',
      'thesis': 'THES'
    };
    return typeMap[itemType] || 'GEN';
  }

  escapeBibTeX(text) {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/#/g, '\\#');
  }
}

module.exports = new ExportService();
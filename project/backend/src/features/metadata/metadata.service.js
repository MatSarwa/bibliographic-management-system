const config = require('./config/providers.config');
const ProviderClasses = require('./providers');
const identifierDetector = require('./utils/identifier-detector');
const AppError = require('../../shared/utils/app-error');

class MetadataService {
  constructor() {
    this.providers = {};
    
    
    Object.entries(config)
      .filter(([name]) => !['identifierProviders', 'cache'].includes(name))
      .forEach(([name, providerConfig]) => {
        
        if (providerConfig.baseURL && ProviderClasses[name]) {
          const ProviderClass = ProviderClasses[name];
          
          if (typeof ProviderClass === 'function') {
            try {
              this.providers[name] = new ProviderClass(providerConfig);
            } catch (error) {
              console.error(`${name} initialization failed:`, error.message);
            }
          } else {
            console.warn(`${name} is not a constructor (type: ${typeof ProviderClass})`);
          }
        } else {
          if (!providerConfig.baseURL) {
          }
          if (!ProviderClasses[name]) {
          }
        }
      });

    this.cache = new Map();
    this.cacheTTL = config.cache?.ttl ? config.cache.ttl * 1000 : 3600000;

  }

  async fetch(identifier) {

    const cached = this.getFromCache(identifier);
    if (cached) {
      return cached;
    }

    const detected = identifierDetector.detect(identifier);
    
    if (!detected.isValid) {
      throw new AppError(`Invalid identifier: ${identifier}`, 400);
    }


    const providerNames = config.identifierProviders?.[detected.type] || [];
    
    if (providerNames.length === 0) {
      throw new Error(`No provider configured for identifier type: ${detected.type}`);
    }

    let result = null;
    let lastError = null;

    for (const providerName of providerNames) {
      const provider = this.providers[providerName];

      if (!provider) {
        console.warn(`[Metadata] Provider "${providerName}" not available, skipping...`);
        continue;
      }

      try {
        
        if (detected.type === 'doi') {
          result = await provider.fetchByDOI(detected.value);
        } else if (detected.type === 'isbn') {
          result = await provider.fetchByISBN(detected.value);
        } else if (detected.type === 'pmid') {
          result = await provider.fetchById(detected.value);
        } else if (detected.type === 'arxiv') {
          result = await provider.fetchById(detected.value);
        } else {
          throw new AppError(`Unsupported identifier type: ${detected.type}`, 400);
        }

        if (result) {
          break;
        }
      } catch (error) {
        console.error(`[Metadata] ${providerName} failed:`, error.message);
        lastError = error;
      }
    }

    if (!result) {
      const errorMsg = lastError?.message || 'All providers failed';
      throw new Error(`Failed to fetch metadata for "${identifier}": ${errorMsg}`);
    }

    this.setCache(identifier, result);


    return result;
  }

  async search(query, options = {}) {
    const providerNames = Object.keys(this.providers);


    const results = await Promise.all(
      providerNames.map(async (name) => {
        const provider = this.providers[name];
        
        try {
          const providerResults = await provider.search(query, options);
          return providerResults;
        } catch (error) {
          console.error(`[${name}] Search failed:`, error.message);
          return [];
        }
      })
    );

    const allResults = results.flat();
    const limited = allResults.slice(0, options.limit || 20);


    return limited;
  }

  getFromCache(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    const maxSize = config.cache?.maxSize || 1000;
    if (this.cache.size > maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  clearCache() {
    const size = this.cache.size;
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: config.cache?.maxSize || 1000,
      providers: Object.keys(this.providers)
    };
  }
}

module.exports = new MetadataService();
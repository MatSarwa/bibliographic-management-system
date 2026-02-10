const config = require('./config/providers.config');
const ProviderClasses = require('./providers');
const identifierDetector = require('./utils/identifier-detector');

class MetadataService {
  constructor() {
    this.providers = {};
    
    console.log('Initializing Metadata Service...');
    console.log('Available provider classes:', Object.keys(ProviderClasses));
    
    Object.entries(config)
      .filter(([name]) => !['identifierProviders', 'cache'].includes(name))
      .forEach(([name, providerConfig]) => {
        
        if (providerConfig.baseURL && ProviderClasses[name]) {
          const ProviderClass = ProviderClasses[name];
          
          if (typeof ProviderClass === 'function') {
            try {
              this.providers[name] = new ProviderClass(providerConfig);
              console.log(`${name} initialized successfully`);
            } catch (error) {
              console.error(`${name} initialization failed:`, error.message);
            }
          } else {
            console.warn(`${name} is not a constructor (type: ${typeof ProviderClass})`);
          }
        } else {
          if (!providerConfig.baseURL) {
            console.log(`Skipping ${name} - no baseURL`);
          }
          if (!ProviderClasses[name]) {
            console.log(`Skipping ${name} - class not found`);
          }
        }
      });

    this.cache = new Map();
    this.cacheTTL = config.cache?.ttl ? config.cache.ttl * 1000 : 3600000;

    console.log('Metadata service initialized with providers:', Object.keys(this.providers));
    console.log('Total providers active:', Object.keys(this.providers).length);
  }

  async fetch(identifier) {

    const cached = this.getFromCache(identifier);
    if (cached) {
      console.log(`[Cache HIT] ${identifier}`);
      return cached;
    }

    const detected = identifierDetector.detect(identifier);
    
    if (!detected.isValid) {
      throw new Error(`Invalid identifier: ${identifier}`);
    }

    console.log(`[Metadata] Detected: ${detected.type} = ${detected.value}`);

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
        console.log(`[Metadata] Trying provider: ${providerName}`);
        
        if (detected.type === 'doi') {
          result = await provider.fetchByDOI(detected.value);
        } else if (detected.type === 'isbn') {
          result = await provider.fetchByISBN(detected.value);
        } else if (detected.type === 'pmid') {
          result = await provider.fetchById(detected.value);
        } else if (detected.type === 'arxiv') {
          result = await provider.fetchById(detected.value);
        } else {
          throw new Error(`Unsupported identifier type: ${detected.type}`);
        }

        if (result) {
          console.log(`[Metadata] Success with ${providerName}`);
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

    console.log(`[Metadata] Successfully fetched: ${result.title?.substring(0, 50)}...`);

    return result;
  }

  async search(query, options = {}) {
    const providerNames = Object.keys(this.providers);

    console.log(`[Metadata] Searching "${query}" across ${providerNames.length} providers...`);

    const results = await Promise.all(
      providerNames.map(async (name) => {
        const provider = this.providers[name];
        
        try {
          console.log(`[Metadata] Searching in ${name}...`);
          const providerResults = await provider.search(query, options);
          console.log(`[Metadata] ${name} returned ${providerResults.length} results`);
          return providerResults;
        } catch (error) {
          console.error(`[${name}] Search failed:`, error.message);
          return [];
        }
      })
    );

    const allResults = results.flat();
    const limited = allResults.slice(0, options.limit || 20);

    console.log(`[Metadata] Total results: ${allResults.length}, returning: ${limited.length}`);

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
    console.log(`[Cache] Cleared ${size} entries`);
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
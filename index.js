const { createProvider } = require('../utils/provider');
const axios = require('axios');
const cheerio = require('cheerio');

// Tüm Türkçe dizi ve anime siteleri
const SITES = [
  { url: 'https://anizium.co', name: 'Anizium', selector: 'a[href*="/anime/"]' },
  { url: 'https://asyaanimeleri.vip', name: 'Asya Animeeri', selector: 'a[href*="/anime/"]' },
  { url: 'https://asyaminik.com', name: 'Asya Minik', selector: 'a[href*="/dizi/"]' },
  { url: 'https://asyawatch.com', name: 'AsyaWatch', selector: 'a[href*="/watch/"]' },
  { url: 'https://www.ddizi.im', name: 'D-Dizi', selector: 'a[href*="/dizi/"]' },
  { url: 'https://diziasya.com', name: 'DiziAsya', selector: 'a[href*="/"]' },
  { url: 'https://www.dizibox.live', name: 'DiziBox', selector: 'a.title' },
  { url: 'https://dizikorea3.com', name: 'Dizi Korea', selector: 'a[href*="/dizi/"]' },
  { url: 'https://dizimag.eu', name: 'DiziMag', selector: 'a[href*="/dizi/"]' },
  { url: 'https://www.dizimom.best', name: 'DiziMom', selector: 'a[href*="/"]' },
  { url: 'https://dizipal152.co', name: 'DiziPal', selector: 'a[href*="/dizi/"]' },
  { url: 'https://filmekseni.top', name: 'Film Ekseni', selector: 'a[href*="/film/"]' },
  { url: 'https://filmmakinesi.to', name: 'Film Makinesi', selector: 'a[href*="/"]' },
  { url: 'https://www.fullhdfilmizlesene.life', name: 'FullHD Film', selector: 'a[href*="/film/"]' },
  { url: 'https://www.hdfilmcehennemi.nl', name: 'HD Film Cehennemi', selector: 'a.film-item' },
  { url: 'https://anizm.net', name: 'Anizm', selector: 'a[href*="/anime/"]' },
  { url: 'https://www.turkanime.tv', name: 'Turk Anime', selector: 'a[href*="/anime/"]' },
  { url: 'https://www.tranimeizle.io', name: 'TR Anime İzle', selector: 'a[href*="/anime/"]' },
  { url: 'https://openani.me', name: 'OpenAnime', selector: 'a[href*="/anime/"]' },
  { url: 'https://seiwatch.net', name: 'Seiwatch', selector: 'a[href*="/"]' },
  { url: 'https://www.sinema.gg', name: 'Sinema', selector: 'a[href*="/"]' },
  { url: 'https://sinezy.to', name: 'Sinezy', selector: 'a[href*="/"]' },
  { url: 'https://tvdiziler.tv', name: 'TV Diziler', selector: 'a[href*="/dizi/"]' },
  { url: 'https://webdramaturkey2.com', name: 'Web Drama Turkey', selector: 'a[href*="/"]' },
  { url: 'https://yabancidizi.life', name: 'Yabancı Dizi', selector: 'a[href*="/dizi/"]' },
  { url: 'https://dizillahd.com', name: 'Dizilla HD', selector: 'a[href*="/dizi/"]' },
  { url: 'https://www.diziyou.one', name: 'DiziYou', selector: 'a[href*="/"]' },
  { url: 'https://dizifilm.bepeak.net', name: 'Dizi Film', selector: 'a[href*="/"]' }
];

// Site ikonları
const SITE_ICONS = {
  'Anizium': '🎌',
  'Asya Animeeri': '🎬',
  'Asya Minik': '👶',
  'AsyaWatch': '👀',
  'D-Dizi': '📺',
  'DiziAsya': '🌏',
  'DiziBox': '📦',
  'Dizi Korea': '🇰🇷',
  'DiziMag': '📰',
  'DiziMom': '👩‍👧',
  'DiziPal': '👥',
  'Film Ekseni': '🎞️',
  'Film Makinesi': '⚙️',
  'FullHD Film': '🎥',
  'HD Film Cehennemi': '👹',
  'Anizm': '🎨',
  'Turk Anime': '🇹🇷',
  'TR Anime İzle': '👁️',
  'OpenAnime': '🔓',
  'Seiwatch': '⌚',
  'Sinema': '🎭',
  'Sinezy': '✨',
  'TV Diziler': '📡',
  'Web Drama Turkey': '🎪',
  'Yabancı Dizi': '🌍',
  'Dizilla HD': '💎',
  'DiziYou': '🎯',
  'Dizi Film': '🎬'
};

// Helper fonksiyon - Site ikonu al
function getSiteIcon(siteName) {
  return SITE_ICONS[siteName] || '🎬';
}

// Helper fonksiyon - Site ara
async function searchSite(site, query, maxResults) {
  try {
    const searchUrl = `${site.url}/search?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchUrl, {
      timeout: 5000,
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    const siteResults = [];
    
    $(site.selector).slice(0, maxResults).each((index, element) => {
      const title = $(element).text().trim();
      const url = $(element).attr('href');
      
      if (title && url && title.length > 2) {
        const fullUrl = url.startsWith('http') ? url : `${site.url}${url}`;
        siteResults.push({
          title,
          url: fullUrl,
          source: site.name,
          icon: getSiteIcon(site.name)
        });
      }
    });
    
    if (siteResults.length > 0) {
      console.log(`  ✓ ${site.name}: ${siteResults.length} sonuç`);
    }
    
    return siteResults;
  } catch (e) {
    console.log(`  ✗ ${site.name}: Hata (${e.message})`);
    return [];
  }
}

const provider = createProvider({
  id: 'turkish-general',
  name: '🇹🇷 Türkçe Genel Kaynaklar',
  description: 'Anizium, Türkanime, HDFilmCehennemi, DiziBox, Dizilla, DiziPal, FullHDFilmizlesene, InatBox, OpenAnime vb. 28 Türkçe dizi ve anime sitesi',
  language: 'tr',
  type: 'movie',
  
  async search(query, type) {
    const results = [];
    const maxPerSite = 2; // Her siteden max 2 sonuç
    
    console.log(`\n🔍 Arama başladı: "${query}" (${SITES.length} sitede)\n`);
    
    // Tüm siteleri paralel olarak ara
    const searchPromises = SITES.map(site => searchSite(site, query, maxPerSite));
    const searchResults = await Promise.allSettled(searchPromises);
    
    // Sonuçları birleştir
    searchResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(...result.value);
      }
    });
    
    console.log(`\n✅ Toplam ${results.length} sonuç bulundu\n`);
    return results;
  },
  
  async getStreams(media) {
    try {
      console.log(`🔗 Stream linkleri aranıyor: ${media.source}`);
      const { data } = await axios.get(media.url, {
        timeout: 5000,
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(data);
      const streams = [];
      
      // Farklı stream seçicileri dene
      const selectors = [
        'a[href*="stream"]',
        'a[href*="play"]',
        'a[href*="watch"]',
        'a[href*="video"]',
        'button[data-url]',
        '.player',
        'iframe[src*="watch"]'
      ];
      
      selectors.forEach(selector => {
        $(selector).each((index, element) => {
          const name = $(element).text().trim() || $(element).attr('data-name') || `Stream ${streams.length + 1}`;
          const url = $(element).attr('href') || $(element).attr('src') || $(element).attr('data-url');
          
          if (url && url.length > 5 && !streams.some(s => s.url === url)) {
            streams.push({ name, url, quality: 'HD' });
          }
        });
      });
      
      console.log(`✅ ${streams.length} stream bulundu`);
      return streams;
    } catch (e) {
      console.error('❌ Stream hatası:', e.message);
      return [];
    }
  }
});

module.exports = provider;

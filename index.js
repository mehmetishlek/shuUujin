// Nuvio'da axios yerine yerleşik fetch kullanılır.
// cheerio yerine ise RegExp (Düzenli İfadeler) ile veri çekilir.

const SITES = [
  { url: 'https://anizium.co', name: 'Anizium', searchPath: '/arama?q=', selector: /<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g },
  { url: 'https://filmmakinesi.to', name: 'Film Makinesi', searchPath: '/?s=', selector: /<div class="title">([^<]+)<\/div>.*<a href="([^"]+)"/g }
  // Buraya diğer siteleri de benzer regex yapılarıyla eklemelisin.
];

// Basit bir HTML tag temizleyici
function cleanText(text) {
  return text ? text.replace(/<[^>]*>/g, '').trim() : '';
}

async function searchSite(site, query) {
  try {
    const searchUrl = site.url + site.searchPath + encodeURIComponent(query);
    
    // Nuvio'nun fetch fonksiyonu
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const html = await response.text();
    const results = [];
    
    // Regex ile basit eşleşme (Örnek mantıktır, her site için özelleştirilmelidir)
    let match;
    let count = 0;
    while ((match = site.selector.exec(html)) !== null && count < 3) {
      results.push({
        title: cleanText(match[2] || match[1]),
        url: match[1].startsWith('http') ? match[1] : site.url + match[1],
        source: site.name
      });
      count++;
    }
    return results;
  } catch (e) {
    return [];
  }
}

// ===== NUVIO HANDLER =====
const handler = async (request) => {
  const { resource, type, id, extra } = request;

  if (resource === 'catalog') {
    const searchQuery = extra && extra.search;
    if (!searchQuery) return { metas: [] };

    // Tüm siteleri tara (Performans için ilk 5 siteyi örnek alalım)
    const promises = SITES.slice(0, 8).map(site => searchSite(site, searchQuery));
    const allResults = await Promise.all(promises);
    const flatResults = allResults.flat();

    return {
      metas: flatResults.map((item, idx) => ({
        // ID prefix'i manifestteki ile uyumlu olmalı (tt veya shuuujin_)
        id: "shuuujin_" + btoa(item.url).substring(0, 10), 
        type: type || 'movie',
        name: item.title,
        poster: "https://via.placeholder.com/300x450?text=" + encodeURIComponent(item.source),
        description: "Kaynak: " + item.source,
        // Nuvio'da direkt linkler 'links' içinde değil, meta detayında verilir
      }))
    };
  }

  if (resource === 'meta') {
    // Bir içeriğe tıklandığında detay sayfası
    return {
      meta: {
        id: id,
        type: type,
        name: "İçerik Detayı",
        description: "Bu içerik seçilen kaynaktan çekildi."
      }
    };
  }

  if (resource === 'stream') {
    // Video linkini döndürdüğün yer
    return {
      streams: [
        {
          title: "Kaynak Sunucu",
          url: "https://ornek-video-linki.com/video.mp4" // Burayı kazıman (scrape) gerekecek
        }
      ]
    };
  }

  return {};
};

// Nuvio eklentiyi bu şekilde export etmeni bekler
export default handler;

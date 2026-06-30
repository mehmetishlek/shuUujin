export default async function(request) {
    const { resource, extra } = request;

    if (resource === 'catalog' && extra && extra.search) {
        return {
            metas: [
                {
                    id: "shj_test",
                    type: "movie",
                    name: extra.search + " için sistem hazır!",
                    poster: "https://via.placeholder.com/300x450?text=BAGLANTI+TAMAM",
                    description: "Eklenti başarıyla bağlandı. Şimdi site ekleme aşamasına geçebiliriz."
                }
            ]
        };
    }

    return { metas: [] };
}

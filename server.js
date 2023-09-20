const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

function getRandomElement(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

app.post('/search', async (req, res) => {
  try {
    const query = req.body['proximo-a'];
    const encodedQuery = encodeURIComponent(query);

    const googleUrl = `https://www.google.com/search?sca_esv=562741715&rlz=1C5GCEM_enBR1054BR1054&tbs=lf:1,lf_ui:9&tbm=lcl&q=restaurantes+proximos+${encodedQuery}`;

    const headers = {
      'authority': 'www.google.com',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
      'Cookie': '1P_JAR=2023-09-20-18; AEC=Ad49MVFjDT_vMATm-6YDaCo7XjNJftC90Yr1N2Q2i9E75VenVgfnaKGjcA; NID=511=vuTvCbQnOzhUiTaFBRK-E05Z7CjRF9IvUYsxPu28tgUE55KPMUrC7-T7VnVgkuyeyU6PH3eajDdHgEs1rpmcEW0GRfAOtcWxrsOGhEcbUGh4ymqqpD-WU8FM8cXcLHSI5Upgpi5CGhg1cEgdw4NxdZ-PQn4bKGgZdkqOAyfzdy3rFn5x74HG5WpsKuJJ-lOmzeibwhDYPhX-PfCWe3OcziyfY6YqtvZEevE2U_26RA86b3klbNduoULSwPpz6_3mgiTB2kD1ICbO7WhcqUTzeJIpYaUDqgWsEiFu'
    };

    const response = await axios.get(googleUrl, { headers });

    const $ = cheerio.load(response.data);

    const resultElements = [];

    $('[jscontroller="AtSb"]').each((index, element) => {
      const restaurantName = $(element).find('.OSrXXb:not(.WaZi0e):not(.gqguwf)').text();
      const rating = $(element).find('.yi40Hd.YrbPuc').text();

      const metaDataElement = $(element).find('div[data-lat][data-lng]');
      const metaData = metaDataElement.next().text().trim();
      
      if (restaurantName !== "Restaurante") {
        resultElements.push({
          restaurante:restaurantName,
          nota:rating,
          dados:metaData,
        });
      }
    });

    // Obter um elemento aleatório do array resultElements
    const randomItem = getRandomElement(resultElements);

    res.json({ result: randomItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar resultados' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

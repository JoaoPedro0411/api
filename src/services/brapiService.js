const axios = require("axios");
//BackEnd
class BrapiService {
  constructor() {
    this.apiToken = process.env.BRAPI_TOKEN;
    this.baseUrl = process.env.BRAPI_BASE_URL;

    this.brapi = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
      timeout: 5000,
    });
  }

  async getAsset(ticker) {
    try {
      const response = await this.brapi.get(`/quote/${ticker}`);
      if (!response.data) {
        throw new Error("(getAsset - brapiService): Nenhum dado encontrado na resposta da API.");
      }
      const data = response.data;

      const assetData = {
        currency: data.results[0].currency,
        shortName: data.results[0].shortName,
        longName: data.results[0].longName,
        symbol: data.results[0].symbol,
        logoUrl: data.results[0].logourl,
        regularMarketPrice: data.results[0].regularMarketPrice,
        earningsPerShare: data.results[0].earningsPerShare,
        regularMarketPreviousClose:data.results[0].regularMarketPreviousClose
      };

      console.log(assetData);
      return assetData;
    } catch (error) {
      console.error("(getAssets- brapiService): Erro ao buscar lista de ativos:", error.message);
      throw new Error(`(getAsset - brapiService): Erro ao buscar lista de ativos: ${error.message}`);
    }
  }

  async getAssets(type, limit) {
    try {
      const response = await this.brapi.get(
        `quote/list?type=${type}&limit=${limit}`
      );
      if (!response.data) {
        throw new Error("(getAssets - brapiService): Nenhum dado encontrado na resposta da API.");
      }
      const data = response.data.stocks;
      return data;
    } catch (error) {
      console.error("(getAssets - brapiService): Erro ao buscar lista de ativos:", error.message);
      throw new Error(`(getAssets - brapiService): Erro ao buscar lista de ativos: ${error.message}`);
    }
  }
  
  async getAssetsWithChange(type, limit) {
    try {
      const assetsList = await this.getAssets(type, limit);
      const detailedAssets = [];


      for (const asset of assetsList) {
        const ticker = asset.stock;
        const detailedData = await this.getAsset(ticker);

        const priceChange =
          ((detailedData.regularMarketPrice - detailedData.regularMarketPreviousClose) /
            detailedData.regularMarketPreviousClose) *
          100;

        const assetWithChange = {
          symbol: detailedData.symbol,
          shortName: detailedData.shortName,
          regularMarketPrice: detailedData.regularMarketPrice,
          previousClose: detailedData.regularMarketPreviousClose,
          priceChangePercent: priceChange.toFixed(2),
          logoUrl: detailedData.logoUrl,
        };

        detailedAssets.push(assetWithChange);
      }

      return detailedAssets;
    } catch (error) {
      console.error("(getAssetsWithChange - brapiService): Erro ao obter ativos com variação de preço:", error.message);
      throw new Error("(getAssetsWithChange - brapiService): Erro ao obter ativos com variação de preço");
    }
  }
}


module.exports = new BrapiService();

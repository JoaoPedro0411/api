const axios = require("axios");

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

  async getAsset(tickers) {
    try {
      const response = await this.brapi.get(`/quote/${tickers}`);
      if (!response.data) {
        throw new Error("Nenhum dado encontrado na resposta da API.");
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
      console.error("Erro ao buscar lista de ativos:", error.message);
      throw new Error(`Erro ao buscar lista de ativos: ${error.message}`);
    }
  }

  async getAssets(type, limit) {
    try {
      const response = await this.brapi.get(
        `quote/list?type=${type}&limit=${limit}`
      );
      if (!response.data) {
        throw new Error("Nenhum dado encontrado na resposta da API.");
      }
      const data = response.data;
      return data;
    } catch (error) {
      console.error("Erro ao buscar lista de ativos:", error.message);
      throw new Error(`Erro ao buscar lista de ativos: ${error.message}`);
    }
  }
}

module.exports = new BrapiService();

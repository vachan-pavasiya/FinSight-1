const axios = require('axios');
const { env } = require('../config/env');

const api = axios.create({ baseURL: env.ANALYTICS_URL });

const categorizeTransactions = async (transactions) => (await api.post('/categorize', { transactions })).data;
const getInsights = async (transactions, budgets) => (await api.post('/insights', { transactions, budgets })).data;
const getAnomalies = async (transactions) => (await api.post('/anomalies', { transactions })).data;
const getPredictions = async (monthlyData) => (await api.post('/predictions', { monthlyData })).data;
const generateReport = async (payload) => (await api.post('/report/generate', payload, { responseType: 'arraybuffer' })).data;

module.exports = { categorizeTransactions, getInsights, getAnomalies, getPredictions, generateReport };

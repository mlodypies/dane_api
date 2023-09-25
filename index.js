const express = require('express');
const axios = require('axios');
const moment = require('moment');

const app = express();
const port = 3000;

const currencyData = {
    USD: { currency: 'american dollar', code: 'USD', mid: null, lastUpdated: null },
    EUR: { currency: 'euro', code: 'EUR', mid: null, lastUpdated: null },
    GBP: { currency: 'pound', code: 'GBP', mid: null, lastUpdated: null }
};

async function fetchExchangeRates() {
    for (const currency of Object.values(currencyData)) {
        try {
            const response = await axios.get(`https://api.nbp.pl/api/exchangerates/rates/a/${currency.code}/?format=json`);
            const rate = response.data.rates[0].mid;
            currency.mid = rate;
            currency.lastUpdated = moment();
        } catch (error) {
            console.error(`Błąd podczas pobierania danych dla ${currency.currency}: ${error.message}`);
        }
    }
}

fetchExchangeRates();

setInterval(fetchExchangeRates, 5 * 60 * 1000);

app.use((req, res, next) => {
    const { url } = req;
    let currencyCode = '';

    if (url === '/dollar') {
        currencyCode = 'USD';
    } else if (url === '/euro') {
        currencyCode = 'EUR';
    } else if (url === '/pound') {
        currencyCode = 'GBP';
    }

    if (currencyCode) {
        const currency = currencyData[currencyCode];
        if (currency && currency.mid !== null) {
            res.json({ kurs: currency.mid });
        } else {
            res.status(500).json({ error: 'Nie można pobrać kursu waluty' });
        }
    } else {
        res.status(404).json({ error: 'Nie znaleziono takiego adresu URL' });
    }
});

app.listen(port, () => {
    console.log(`Serwer Express działa na porcie ${port}`);
});
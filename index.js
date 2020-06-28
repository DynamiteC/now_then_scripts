const dotEnv = require('dotenv');
dotEnv.config();

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const oldLiliWooCommerce = new WooCommerceRestApi({
  url: process.env.OLDLILIURL,
  consumerKey: process.env.OLDLILICONSUMERKEY,
  consumerSecret: process.env.OLDLILICONSUMERSECRET,
  version: "wc/v3"
});

const liliHebrewWooCommerce = new WooCommerceRestApi({
  url: process.env.LILIHEBURL,
  consumerKey: process.env.LILIHEBCONSUMERKEY,
  consumerSecret: process.env.LILIHEBCONSUMERSECRET,
  version: "wc/v3"
});

const liliEnglishWooCommerce = new WooCommerceRestApi({
  url: process.env.LILIENURL,
  consumerKey: process.env.LILIENCONSUMERKEY,
  consumerSecret: process.env.LILIENCONSUMERSECRET,
  version: "wc/v3"
});

let getOldLiliProducts = async () => {
  let products = await new Promise((resolve, reject) => {
    oldLiliWooCommerce.get('products', {per_page: 10}).then(resolve).catch(reject);
  });
  console.log(products);
}

let getLiliHebProducts = async () => {
  let products = await new Promise((resolve, reject) => {
    liliHebrewWooCommerce.get('products', {per_page: 10}).then(resolve).catch(reject);
  });
  console.log(products);
}

let getLiliEnProducts = async () => {
  let products = await new Promise((resolve, reject) => {
    liliEnglishWooCommerce.get('products', {per_page: 10}).then(resolve).catch(reject);
  });
  console.log(products);
}

(async () => {
  await getOldLiliProducts();
  await getLiliHebProducts();
  await getLiliEnProducts();
})();
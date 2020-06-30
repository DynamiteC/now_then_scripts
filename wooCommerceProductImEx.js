const dotEnv = require('dotenv');
dotEnv.config();

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

const oldLiliWooCommerceConfig = {
  url: process.env.OLDLILIURL,
  consumerKey: process.env.OLDLILICONSUMERKEY,
  consumerSecret: process.env.OLDLILICONSUMERSECRET,
  version: "wc/v3"
};

const liliHebrewWooCommerceConfig = {
  url: process.env.LILIHEBURL,
  consumerKey: process.env.LILIHEBCONSUMERKEY,
  consumerSecret: process.env.LILIHEBCONSUMERSECRET,
  version: "wc/v3"
}

const liliEnglishWooCommerceConfig = {
  url: process.env.LILIENURL,
  consumerKey: process.env.LILIENCONSUMERKEY,
  consumerSecret: process.env.LILIENCONSUMERSECRET,
  version: "wc/v3"
};

let makePromiseCalls = async (isFor, type, endpoint, options) => {
  try {
    console.log('makePromiseCalls');
    console.log([isFor, type, endpoint]);
    console.log(options);
    let apiCallMaker = undefined, apiCallMakerConfig;
    if (isFor === 'OLD') {
      apiCallMakerConfig = oldLiliWooCommerceConfig;
    } else if (isFor === 'HEB') {
      apiCallMakerConfig = liliHebrewWooCommerceConfig;
    } else {
      apiCallMakerConfig = liliEnglishWooCommerceConfig;
    }
    apiCallMaker = new WooCommerceRestApi(apiCallMakerConfig);
    let response = await new Promise((resolve, reject) => apiCallMaker[type](endpoint, options).then(response => resolve(response.data)).catch(
      error => reject((error.response !== undefined) ? error.response.data : error)
    ));
    apiCallMaker = undefined;
    return response;
  } catch (error) {
    console.error(JSON.stringify(error));
    console.error(error.message);
    return {};
  }
};

let deleteAndAddProductsCategories = async () => {
  console.log('deleteAndAddProductsCategories');
  await deleteLiliHebrewCategories();
  await deleteLiliEnglishCategories();
  await addLiliHebrewCategories();
  await addLiliEnglishCategories();
}

let deleteAndAddProductsAttributes = async () => {
  console.log('deleteAndAddProductsAttributes');
  await deleteLiliHebrewAttributes();
  await deleteLiliEnglishAttributes();
  await addLiliHebrewAttributes();
  await addLiliEnglishAttributes();
}

let deleteAndAddProducts = async () => {
  console.log('deleteAndAddProducts');
  await deleteLiliHebrewProducts();
  await deleteLiliEnglishProducts();
  await addLiliHebrewProducts();
  await addLiliEnglishProducts();
}

let deleteLiliHebrewCategories = async () => {
  console.log('deleteLiliHebrewCategories');
  return await deleteLiliCategories('HEB');
}

let deleteLiliEnglishCategories = async () => {
  console.log('deleteLiliEnglishCategories');
  return await deleteLiliCategories('ENG');
}

let addLiliHebrewCategories = async () => {
  console.log('addLiliHebrewCategories');
  return await addLiliCategories('he', 'HEB');
}

let addLiliEnglishCategories = async () => {
  console.log('addLiliEnglishCategories');
  return await addLiliCategories('en', 'ENG');
}

let deleteLiliHebrewAttributes = async () => {
  console.log('deleteLiliHebrewAttributes');
  return await deleteLiliAttributes('HEB');
}

let deleteLiliEnglishAttributes = async () => {
  console.log('deleteLiliEnglishAttributes');
  return await deleteLiliAttributes('ENG');
}

let addLiliHebrewAttributes = async () => {
  console.log('addLiliHebrewAttributes');
  return await addLiliAttributes('he', 'HEB');
}

let addLiliEnglishAttributes = async () => {
  console.log('addLiliEnglishAttributes');
  return await addLiliAttributes('en', 'ENG');
}

let deleteLiliHebrewProducts = async () => {
  console.log('deleteLiliHebrewProducts');
  return await deleteLiliProducts('HEB');
}

let deleteLiliEnglishProducts = async () => {
  console.log('deleteLiliEnglishProducts');
  return await deleteLiliProducts('ENG');
}

let addLiliHebrewProducts = async () => {
  console.log('addLiliHebrewProducts');
  return await addLiliProducts('he', 'HEB');
}

let addLiliEnglishProducts = async () => {
  console.log('addLiliEnglishProducts');
  return await addLiliProducts('en', 'ENG');
}

let deleteLiliCategories = async (wooSite) => {
  console.log('deleteLiliCategories');
  return new Promise(async resolve => {
    let page = 1;
    let categoryIds = [];
    do {
      let categoryResponse = await makePromiseCalls(wooSite, 'get', 'products/categories', {per_page: 100, page});
      if (categoryResponse.length === 0) {
        break;
      }
      categoryResponse = categoryResponse.filter(d => d.name !== 'Uncategorized');
      categoryIds = [...categoryIds, ...categoryResponse.map(d => d.id)];
      page = page + 1;
    } while (true);
    categoryIds = categoryIds.sort((a, b) => b - a);
    for (let x = 0; x < categoryIds.length; x++) {
      try {
        await makePromiseCalls(wooSite, 'delete', 'products/categories/' + categoryIds[x], {force: true});
      } catch (error) {
        console.error(error);
      }
    }
    console.log("COMPLETED....DELETE LILI CATEGORIES");
    resolve();
  });
}

let deleteLiliAttributes = async (wooSite) => {
  console.log('deleteLiliAttributes');
  return new Promise(async resolve => {
    let attributeIds = [];
    let attributeResponse = await makePromiseCalls(wooSite, 'get', 'products/attributes', {});
    attributeIds = [...attributeIds, ...attributeResponse.map(d => d.id)];
    for (let x = 0; x < attributeIds.length; x++) {
      try {
        await makePromiseCalls(wooSite, 'delete', 'products/attributes/' + attributeIds[x], {force: true});
      } catch (error) {
        console.error(error);
      }
    }
    console.log("COMPLETED....DELETE LILI ATTRIBUTES");
    resolve();
  });
}

let deleteLiliProducts = async (wooSite) => {
  console.log('deleteLiliProducts');
  return new Promise(async resolve => {
    let page = 1;
    let productIds = [];
    do {
      let productResponse = await makePromiseCalls(wooSite, 'get', 'products', {per_page: 100, page});
      if (productResponse.length === 0) {
        break;
      }
      productIds = [...productIds, ...productResponse.map(d => d.id)];
      page = page + 1;
    } while (true);
    for (let x = 0; x < productIds.length; x++) {
      try {
        await makePromiseCalls(wooSite, 'delete', 'products/' + productIds[x], {force: true});
      } catch (error) {
        console.error(error);
      }
    }
    console.log("COMPLETED....DELETE LILI PRODUCTS")
    resolve();
  });
}

let addLiliCategories = async (lang, wooSite) => {
  console.log('addLiliCategories');
  let parentChildCategoriesIds = [], categories = {}, categoryIdObject = {};
  return new Promise(async resolve => {
    let page = 1;
    do {
      let categoryResponse = await makePromiseCalls('OLD', 'get', 'products/categories', {per_page: 100, page, lang});
      if (categoryResponse.length === 0) {
        break;
      }
      for (let x = 0; x < categoryResponse.length; x++) {
        if (categoryResponse[x].name === 'Uncategorized') {
          continue;
        }
        categories[categoryResponse[x].id] = {
          name: categoryResponse[x].name,
          description: categoryResponse[x].description,
          slug: categoryResponse[x].slug
        }

        if (categoryResponse[x].image !== null) {
          categories[categoryResponse[x].id].image = {
            src: categoryResponse[x].image.src
          }
        }
        parentChildCategoriesIds.push([categoryResponse[x].id, categoryResponse[x].parent]);
        categoryIdObject[categoryResponse[x].id] = {
          old_parent: categoryResponse[x].parent
        }
      }
      page = page + 1;
    } while (true);
    parentChildCategoriesIds = parentChildCategoriesIds.sort((a, b) => ((a[0] + a[1]) - (b[0] + b[1])));
    for (let x = 0; x < parentChildCategoriesIds.length; x++) {
      let categoryData = categories[parentChildCategoriesIds[x][0]];
      if (categories[parentChildCategoriesIds[x][0]].old_parent !== 0) {
        categoryData.parent = categoryIdObject[parentChildCategoriesIds[x][0]].current_parent;
      }
      let newCategory = await makePromiseCalls(wooSite, "post", "products/categories", categoryData);
      let childIds = parentChildCategoriesIds.filter(p => p[1] === parentChildCategoriesIds[x][0]);
      for (let c = 0; c < childIds.length; c++) {
        categoryIdObject[childIds[c][0]].current_parent = newCategory.id;
      }
    }
    console.log("COMPLETED....ADDED LILI CATEGORIES");
    resolve();
  })
}

let addLiliAttributes = async (lang, wooSite) => {
  console.log('addLiliAttributes');
  return new Promise(async resolve => {
    let attributeResponse = await makePromiseCalls('OLD', 'get', 'products/attributes', {lang});
    for (let x = 0; x < attributeResponse.length; x++) {
      let attributeObject = {
        name: attributeResponse[x].name,
        slug: attributeResponse[x].slug
      };
      let page = 1;
      let attributeTerms = []
      do {
        let attributeTermsResponse = await makePromiseCalls('OLD', 'get', 'products/attributes/' + attributeResponse[x].id + '/terms', {
          per_page: 100,
          page,
          lang
        });
        if (attributeTermsResponse.length === 0) break;
        attributeTerms = [...attributeTerms, ...attributeTermsResponse.map(d => d.name)];
        page = page + 1;
      } while (true);
      let newAttribute = await makePromiseCalls(wooSite, 'post', 'products/attributes', attributeObject);
      if (newAttribute.id) {
        for (let t = 0; t < attributeTerms.length; t++) {
          await makePromiseCalls(wooSite, 'post', 'products/attributes/' + newAttribute.id + '/terms', {
            name: attributeTerms[t]
          });
        }
      }
    }
    console.log("COMPLETED....ADDED LILI ATTRIBUTES")
    resolve();
  })
}

let addLiliProducts = async (lang, wooSite) => {
  console.log('addLiliProducts');
  let categories = await new Promise(async resolve => {
    let page = 1;
    let categoryObject = {};
    do {
      let categoryResponse = await makePromiseCalls('OLD', 'get', 'products/categories', {per_page: 100, page, lang});
      if (categoryResponse.length === 0) {
        break;
      }
      for (let x = 0; x < categoryResponse.length; x++) {
        categoryObject[categoryResponse[x].id] = {
          name: categoryResponse[x].name,
          description: categoryResponse[x].description,
          slug: categoryResponse[x].slug,
          old_id: categoryResponse[x].id
        }
      }
      page = page + 1;
    } while (true);
    page = 1;
    do {
      let categoryResponse = await makePromiseCalls(wooSite, 'get', 'products/categories', {per_page: 100, page, lang});
      if (categoryResponse.length === 0) {
        break;
      }
      for (let x = 0; x < categoryResponse.length; x++) {
        for (let category in categoryObject) {
          if (categoryObject[category].slug === categoryResponse[x].slug) {
            categoryObject[category].new_id = categoryResponse[x].id;
            break;
          }
        }
      }
      page = page + 1;
    } while (true);
    resolve(categoryObject);
  });

  let attributes = await new Promise(async resolve => {
    let attributeObject = {};
    let attributeResponse = await makePromiseCalls('OLD', 'get', 'products/attributes', {lang});
    for (let x = 0; x < attributeResponse.length; x++) {
      attributeObject[attributeResponse[x].id] = {
        name: attributeResponse[x].name,
        slug: attributeResponse[x].slug,
        old_id: attributeResponse[x].id
      }
    }
    let newAttributeResponse = await makePromiseCalls(wooSite, 'get', 'products/attributes', {lang});
    for (let x = 0; x < newAttributeResponse.length; x++) {
      for (let attribute in attributeObject) {
        if (attributeObject[attribute].name === newAttributeResponse[x].name) {
          attributeObject[attribute].new_id = newAttributeResponse[x].id;
          break;
        }
      }
    }
    resolve(attributeObject);
  });
  await new Promise(async resolve => {
    let page = 1;
    do {
      let productResponse = await makePromiseCalls('OLD', 'get', 'products', {per_page: 5, page, lang});
      if (productResponse.length === 0) {
        break;
      }
      let productObject = {}, productVariationObject = {};
      for (let x = 0; x < productResponse.length; x++) {
        let prod = productResponse[x];
        let oldProductId = productResponse[x].id;
        productObject[oldProductId] = {
          name: prod.name,
          type: prod.type,
          status: prod.status,
          regular_price: prod.regular_price || prod.price,
          sale_price: prod.sale_price || prod.price,
          tax_status: prod.tax_status,
          tax_class: prod.tax_class,
          manage_stock: prod.manage_stock,
          stock_quantity: prod.stock_quantity,
          stock_status: prod.stock_status,
          categories: productResponse[x].categories.filter(d => categories[d.id] !== undefined).map(d => {
            return {
              id: categories[d.id].new_id
            }
          }),
          images: productResponse[x].images.map(d => {
            delete d.id;
            return d;
          }),
          attributes: productResponse[x].attributes.filter(d => attributes[d.id] !== undefined).map(d => {
            d.id = attributes[d.id].new_id;
            return d;
          })
        }
        if (prod.type === 'variable') {
          let productVariationResponse = await makePromiseCalls('OLD', 'get', 'products/' + oldProductId + '/variations', {
            per_page: 100,
            lang
          });
          productVariationObject[oldProductId] = {};
          productVariationObject[oldProductId] = productVariationResponse.map(variation => {
            return {
              regular_price: variation.regular_price,
              tax_status: variation.tax_status,
              tax_class: variation.tax_class,
              manage_stock: variation.manage_stock,
              stock_quantity: variation.stock_quantity,
              stock_status: variation.stock_status,
              attributes: variation.attributes.map(d => {
                d.id = attributes[d.id].new_id;
                return d;
              })
            }
          });
        }
      }
      let createProductObject = Object.keys(productObject).map(d => {
        return productObject[d];
      });
      let batchCreateProductResponse = await makePromiseCalls(wooSite, 'post', 'products/batch', {
        create: createProductObject
      })
      if (batchCreateProductResponse.create.length > 0) {
        let productIds = Object.keys(productObject);
        let newProducts = batchCreateProductResponse.create;
        for (let x = 0; x < newProducts.length; x++) {
          if (productVariationObject[productIds[x]] !== undefined) {
            await makePromiseCalls(wooSite, 'post', 'products/' + newProducts[x].id + '/variations/batch', {
              create: productVariationObject[productIds[x]]
            });
          }
        }
      }
      page = page + 1;
    } while (true);
    resolve();
  })
}
(async () => {
  // await deleteAndAddProducts();
})();
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
    let response = await new Promise((resolve, reject) => apiCallMaker[type](endpoint, options).then(response => resolve(response.data)).catch(error => reject(error.response.data)));
    apiCallMaker = undefined;
    return response;
  } catch (error) {
    console.error(error.error);
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
      console.log(categoryResponse[0]);
      categoryResponse = categoryResponse.filter(d => d.name !== 'Uncategorized');
      categoryIds = [...categoryIds, ...categoryResponse.map(d => d.id)];
      page = page + 1;
    } while (true);
    categoryIds = categoryIds.sort((a, b) => b - a);
    console.log(categoryIds);
    console.log(categoryIds.length);
    for (let x = 0; x < categoryIds.length; x++) {
      try {
        let deletedCategory = await makePromiseCalls(wooSite, 'delete', 'products/categories/' + categoryIds[x], {force: true});
        console.log(deletedCategory);
      } catch (error) {
        console.error(error);
      }
    }
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
        let deletedCategory = await makePromiseCalls(wooSite, 'delete', 'products/attributes/' + attributeIds[x], {force: true});
        console.log(deletedCategory);
      } catch (error) {
        console.error(error);
      }
    }
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
    resolve();
  })
}

let addLiliAttributes = async (lang, wooSite) => {
  console.log('addLiliAttributes');
  return new Promise(async resolve => {
    let attributeResponse = await makePromiseCalls('OLD', 'get', 'products/attributes', {lang});
    for (let x = 0; x < attributeResponse.length; x++) {
      console.log(attributeResponse[x]);
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
      console.log(newAttribute);
      if (newAttribute.id) {
        console.log(attributeTerms);
        for (let t = 0; t < attributeTerms.length; t++) {
          let newAttributeTerm = await makePromiseCalls(wooSite, 'post', 'products/attributes/' + newAttribute.id + '/terms', {
            name: attributeTerms[t]
          });
          console.log(newAttributeTerm);
        }
      }
    }
    resolve();
  })
}

(async () => {

})();
/**
 * Copyright (c) 2019
 *
 * JavaScript for query the Quest IDs from the URL listed in the
 * Qwiklabs Catalog page, then print them with their corresponding
 * quest name to the Developer Console in Chrome.
 *
 * @summary Query the IDs of Qwiklabs Quests in Chrome Console
 * @author Chris KY Fung <chris.ky.fung@connect.polyu.hk>
 *
 * Created at     : 2019-09-08 10:11:15
 * Last modified  : 2019-09-08 10:11:15
 */

// query the hyperlink tag of all catalog items
const items = document.querySelectorAll('div.catalog-item > h3 > a');

// use console.log to print the query results
items.forEach((i) => {
  console.log(i.href.match(/quests.\d*/g) + ' => ' + i.innerHTML);
});

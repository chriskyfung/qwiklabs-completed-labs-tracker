// ==UserScript==
// @name         Qwiklabs Catalog Scraper
// @namespace    https://chriskyfung.github.io/
// @version      0.3
// @author       chriskyfung
// @description  Scraping labs and quests from Qwiklabs Catalog and save as CSV files (You may merge the CSV files with http://merge-csv.com/)
// @icon         https://raw.githubusercontent.com/chriskyfung/qwiklabs-completed-labs-tracker/master/icons/qwiklabs-catalog-scraper-icon-32x32.png
// @icon64       https://raw.githubusercontent.com/chriskyfung/qwiklabs-completed-labs-tracker/master/icons/qwiklabs-catalog-scraper-icon-64x64.png
// @updateURL    https://github.com/chriskyfung/qwiklabs-completed-labs-tracker/raw/master/qwiklabs-catalog-scraper.user.js
// @supportUrl   https://github.com/chriskyfung/qwiklabs-completed-labs-tracker/issues
// @match        https://www.qwiklabs.com/catalog
// @match        https://www.qwiklabs.com/catalog.labs?cloud%5B%5D=AWS&keywords=&locale=&page=*&per_page=100
// @match        https://www.qwiklabs.com/catalog.labs?cloud%5B%5D=GCP&keywords=&locale=&page=*&per_page=100
// @match        https://www.qwiklabs.com/catalog.quests?cloud%5B%5D=AWS&keywords=&locale=&page=*&per_page=100
// @match        https://www.qwiklabs.com/catalog.quests?cloud%5B%5D=GCP&keywords=&locale=&page=*&per_page=100
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.save = function(data, filename){

        if(!data) {
            console.error('Console.save: No data')
            return;
        }

        if(!filename) filename = 'console.json'

        if(typeof data === "object"){
            data = JSON.stringify(data, undefined, 4)
        }

        var blob = new Blob([data], {type: 'text/json'}),
            e    = document.createEvent('MouseEvents'),
            a    = document.createElement('a')

        a.download = filename
        a.href = window.URL.createObjectURL(blob)
        a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        a.dispatchEvent(e)
    }

    function getInnerText(i, c) {
        let n = i.querySelector(c);
        try {
            return n.innerText;
        } catch (e) {
            return "";
        }
    }

    const URL = window.location.href;
    if (URL == "https://www.qwiklabs.com/catalog") {
        document.querySelector("label[for='format_labs']").innerHTML += '<span class="mdl-checkbox__label" style="align-items:flex-start;"><i class="fas fa-file-download"></i>&nbsp;<a href="https://www.qwiklabs.com/catalog.labs?cloud%5B%5D=GCP&keywords=&locale=&page=1&per_page=100" target="_blank">GCP</a><i class="fas fa-file-download"></i>&nbsp;<a href="https://www.qwiklabs.com/catalog.labs?cloud%5B%5D=AWS&keywords=&locale=&page=1&per_page=100" target="_blank">AWS</a></span>';
        document.querySelector("label[for='format_quests']").innerHTML += '<span class="mdl-checkbox__label" style="align-items:flex-start;"><i class="fas fa-file-download"></i>&nbsp;<a href="https://www.qwiklabs.com/catalog.quests?cloud%5B%5D=GCP&keywords=&locale=&page=1&per_page=100" target="_blank">GCP</a><i class="fas fa-file-download"></i>&nbsp;<a href="https://www.qwiklabs.com/catalog.quests?cloud%5B%5D=AWS&keywords=&locale=&page=1&per_page=100" target="_blank">AWS</a></span>';
    } else {
        const type = URL.match(/catalog.(\w+)?/)[1];
        const platformName = URL.match(/cloud%5B%5D=(\w+)&/)[1];
        let iPage;
        try {
            iPage = URL.match(/page=(\w+)&/)[1];
        } catch (e) {
            iPage = 1;
        }

        // query the hyperlink tag of all catalog items
        var items = document.querySelectorAll("div.catalog-item");

        // use console.log to print the query results
        console.group("Calalog Items");

        const csvheader = "type,id,name,duration,level,costs,env\n";
        var csvData = csvheader;

        items.forEach( i => {
            let name = getInnerText(i, ".catalog-item__title"),
                id = i.querySelector(".catalog-item__title > a").href.match(/(focuses|quests)\/(\d+)/)[2],
                dur = getInnerText(i, ".catalog-item-duration"),
                level = getInnerText(i, ".catalog-item-level"),
                cost = getInnerText(i, ".catalog-item-cost");
            let line = `${type},${id},"${name}",${dur},${level},${cost},${platformName}\n`;
            console.log(line);
            csvData += line;
        }
                     );
        console.groupEnd("Calalog Items");

        console.save(csvData, `qwiklabs-${type}-${platformName}-${iPage}.csv`)

        setTimeout(function(){
            const nextBtn = document.querySelector(".next_page");
            if (nextBtn) nextBtn.click();
        }, 3000);
    }
})();
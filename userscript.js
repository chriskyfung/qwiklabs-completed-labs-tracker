// ==UserScript==
// @name         Qwiklabs Complete Indicator
// @namespace    qwiklabs_web
// @version      0.1
// @description  Label completed quests and labs on the Catalog page(s) on Qwiklabs (https://www.qwiklabs.com/catalog)
// @author       chriskyfung
// @match        https://www.qwiklabs.com/catalog*
// @match        https://google.qwiklabs.com/catalog*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var t = document.querySelectorAll('.catalog-item__title');
    // REPLACE WITH THE YOUR COMPLETED QUEST TITLES IN THE ARRAY BELOW
    var completed_quests = [ "Application Development - Python",
                             "Data Engineering",
                           ];
    // REPLACE WITH THE YOUR COMPLETED LAB TITLES IN THE ARRAY BELOW
    var completed_labs = [ "Getting Started with Cloud Shell & gcloud",
                           "A Tour of Qwiklabs and the Google Cloud Platform",
                         ]

    var i;
    for (i=0; i<t.length;i++){
        var title= t[i].innerText;
        var mt = completed_quests.indexOf(title);
        if (mt<0) {
            mt = completed_labs.indexOf(title);
        }
        if (mt>=0){
            t[i].innerHTML += '&nbsp;<span style="color:green"><i class="fas fa-check-circle"></i></span>'
        };
    }
})();

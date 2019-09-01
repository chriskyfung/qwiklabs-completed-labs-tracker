// ==UserScript==
// @name         Qwiklabs Complete Indicator
// @namespace    qwiklabs_web
// @version      0.2
// @description  Label completed quests and labs on the Catalog page(s) on Qwiklabs (https://www.qwiklabs.com/catalog)
// @author       chriskyfung
// @match        https://www.qwiklabs.com/catalog*
// @match        https://google.qwiklabs.com/catalog*
// @match        https://www.qwiklabs.com/focuses/*
// @match        https://google.qwiklabs.com/focuses/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // REPLACE WITH THE YOUR COMPLETED QUEST TITLES IN THE ARRAY BELOW
    var completed_quests = [ "Application Development - Python",
                             "Data Engineering",
                           ];
    // REPLACE WITH THE YOUR COMPLETED LAB TITLES IN THE ARRAY BELOW
    var completed_labs = [ "Getting Started with Cloud Shell & gcloud",
                           "A Tour of Qwiklabs and the Google Cloud Platform",
                         ];
                         
    var t = document.querySelectorAll('.catalog-item__title');
    if (t.length ==0) {
        t = [document.querySelector("div.header__title > h1")];
    };

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

// ==UserScript==
// @name         Qwiklabs Complete Indicator
// @namespace    qwiklabs_web
// @version      0.3
// @description  Label completed quests and labs on the Catalog page(s) on Qwiklabs (https://www.qwiklabs.com/catalog)
// @author       chriskyfung
// @match        https://*.qwiklabs.com/catalog*
// @match        https://*.qwiklabs.com/focuses/*
// @match        https://*.qwiklabs.com/quests/*
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
    // QUEST TITLES FOR WHICH CONTAINS OFFLINE LABS (UPDATED ON 2019-09-15)
    var quests_with_offline_labs = ["Programming Windows on AWS",
                                    "Storage & CDN",
                                    "Websites & Web Apps",
                                    "Big Data on AWS",
                                    "Advanced Operations Using Amazon Redshift",
                                    "Compute & Networking",
                                    "Deployment & Management",
                                    "Alexa Skills Development",
                                    "Security on AWS",
                                    "Corporate Apps on AWS for Windows",
                                    "Databases on AWS for Windows",
                                    "SysAdmin on AWS for Windows",
                                    "SysOps Administrator - Associate",
                                    "Solutions Architect - Associate"
                                    ];
    // QUERY ALL ITEM TITLES IN THE QWIKLAB CALALOG PAGE
    var t = document.querySelectorAll('.catalog-item__title');
    // QUERY PAGE HEADER IF NO CATALOG ITEM IS FOUND
    if (t.length ==0) {
        t = [document.querySelector("div.header__title > h1")];
    };
    // ITERATE EACH ITEM FOUND
    var i;
    for (i=0; i<t.length;i++){
        var title= t[i].innerText;
        // MATCHING PROCESS
        var mt = quests_with_offline_labs.indexOf(title);
        var offline = false;
        if (mt>=0) {
            offline = true;
        } else {
            mt = completed_quests.indexOf(title);
            if (mt<0) {
                mt = completed_labs.indexOf(title);
            };
        };
        // APPEND SYMBOLS IF MATCHED
        if (offline == true) {
            t[i].innerHTML += '&nbsp;<span style="color:goldenrod"><i class="fas fa-exclamation-triangle"></i></span>';
        } else {
            if (mt>=0){
                t[i].innerHTML += '&nbsp;<span style="color:green"><i class="fas fa-check-circle"></i></span>';
            };
        };
    };
})();

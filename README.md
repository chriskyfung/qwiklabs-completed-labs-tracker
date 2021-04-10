# Qwiklabs Lab Completion Tracker

💡 **Label completed quests and labs on Qwiklabs webpages**

[Qwiklabs](https://www.qwiklabs.com) is a great online self-paced learning platform for getting hands-on experience of the Google Cloud Platform. It has over 400 hands-on labs and quests for learn and practice.

As a Qwiklabs user, I figure out it is messy and damp to look up unenrolled quests or incompleted labs from the Qwiklabs Catalog page or Search Results. I desired to make a straight-forward way to identify the catalog items, by adding a green check-circle next to those completed.

![GitHub release (latest by date)](https://img.shields.io/github/v/release/chriskyfung/qwiklabs-completed-labs-tracker) [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) ![GitHub Release Date
](https://img.shields.io/github/release-date/chriskyfung/qwiklabs-completed-labs-tracker) ![GitHub issues
](https://img.shields.io/github/issues-raw/chriskyfung/qwiklabs-completed-labs-tracker)

🎯 **Objectives of this project**

- To develop a handy way to implement the enhancement to Qwiklabs website in a web browser.
- To indicate completed labs and quests in Qwiklabs Catalog pages, thereby easier to inspect the self-learning progress and look for unenrolled quests or incompleted labs.
- To design a location to store and update the name list of the completed items.

For more information, please read [**this post**](https://chriskyfung.github.io/blog/qwiklabs/Qwiklabs-User-Tips-for-Learning_Google_Cloud_Platform) on my GitHub Pages.

 ![chriskyfung.github.io](https://img.shields.io/website?down_message=offline&up_message=online&url=https%3A%2F%2Fchriskyfung.github.io%2Fblog%2Fqwiklabs%2Fuserscript-for-labelling-completed-qwiklabs)
## 🛴 How to Use

This script requires an userscript manager to run it in your browser, such as [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) for Google Chrome. Click on the following button to download and install the script via your userscript manager.

[![Custom badge](https://img.shields.io/badge/-Install%20Script-brightgreen?color=green&logo=tampermonkey&style=for-the-badge)](https://github.com/chriskyfung/qwiklabs-completed-labs-tracker/raw/master/qwiklabs-explorer.user.js)

## 🎠Features

### 🌈 on Home pages

Retrieve the local records and annotate each card in “My Favorites”, “Featured Learning”, and “What’s Hots” sections with badges.

- Screenshot:

  ![badges added to What's Hot cards](/screenshots/qwiklabs-complete-indicator-home-hots.png)

### 🌈 on Catalog pages

Retrieve the local records and annotate each lab and quest item as the following:

- Label the completed labs and quests with a green check-circle.
- Highlight any new labs and quests that you have not yet explored in yellow color.

  ![Screenshot of a Catalog page](/demo-image.png)

### 🌈 on Quest pages

- Automatically add a record for the quest or update the info to the local database
- Add a green check-circle at the end of the page title if the quest is completed.

### 🌈 on Lab pages

- Automatically add a record for the lab or update the info to the local database.
- Add a green check-circle at the end of the lab title if the lab is completed.

  ![Screenshot of a Lab header](/demo-image2.png)

### 🌈 on My Learning page

- Add badges to cards in **My Favorites** section
- Annotate each row in **My Learning Activity** table with colors
- Quick link to view all **My Learning Activity** results
- One-click update the labs and quests status from the activity table to the local database

  ![Quick link and batch update My Learning Activity to database](/screenshots/my-qwiklabs-learning-activity-tracker-v0.5.4.png)

<br>

## 👀 Future Plans

[ ] [Sync IndexedDB across computers](https://github.com/chriskyfung/qwiklabs-completed-labs-tracker/issues/7) (#7)

## 💗 Support Me

Would you like to buy me a coffee? I would really appreciate it if you could support me for this projects.

<a href="https://www.buymeacoffee.com/chrisfungky"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" target="_blank"></a>

## 🤝 Contributing

Pull requests for new features, bug fixes, and suggestions are welcome!

## ⚖ License

Distributed under the [GNU General Public License v3.0](LICENSE)

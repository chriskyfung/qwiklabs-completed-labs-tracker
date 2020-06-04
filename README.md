# Qwiklabs Completed Labs Tracker
Label completed quests and labs on the Catalog page(s) on Qwiklabs (https://www.qwiklabs.com/catalog)

For more information, please read my post "[Userscript for Labelling Completed Qwiklabs](https://chriskyfung.github.io/blog/qwiklabs/Qwiklabs-User-Tips-for-Learning_Google_Cloud_Platform)" on my GitHub Pages.

### Objectives of this project
- To develop a handy way to implement the enhancement to Qwiklabs website in a web browser.
- To indicate completed labs and quests in Qwiklabs Catalog pages, thereby easier to inspect the self-learning progress and look for unenrolled quests or incompleted labs.
- To design a location to store and update the name list of the completed items.

## Why do you need this?

Qwiklabs is a great online self-paced learning platform for getting hands-on experience of the Google Cloud Platform. It has over 400 hands-on labs and quests for learn and practice.

As a Qwiklabs user, I figure out it is messy and damp to lookup unenrolled quests or incompleted labs from the Qwiklabs Catalog page or Search Results. I desired to make a straight-forward way to identify the catalog items, by adding a green check-circle next to those completed.


## Features
- Add a green check-circle at the end of a catalog item that has been completed.
- Easy to execute and edit the userscript via Tampermonkey for Google Chrome
- Add a green check-circle at the end of a lab title if the lab has been completed.

**Ver >= 0.4.5:**
- Improve performance by using JSON-markup for storing lab and quest data.
- Add green highlights to the completed items
- Add annotations to _Your Favorites_ in the **My Learning** page.
- Add color backgrounds to each row in tables of the _Completed Courses_ and _Completed Labs_ pages under the **My Learning** section for cross-checking.

**Ver >= 0.4.8:**
- Add yellow highlights and badges to any labs and quests unregistered to the JSON-markup data.
- Extend color schemes to the short tables of the _Completed Courses_ and _Completed Labs_ pages on the **My Learning** page.
- Enhance the annotation scheme to the “Your Favorites”, “Featured Learning”, and “What’s Hots” sections on the Home page.

## Demo Screenshot
![demo image](/demo-image.png)
Screenshot of a Catalog page

<br>

![demo image](/demo-image2.png)
Screenshot of a Lab header


## Future Plans

- [Export Profile as Files](https://github.com/chriskyfung/qwiklabs-completed-labs-tracker/issues/6) #6
- [Import Downloaded Profile](https://github.com/chriskyfung/qwiklabs-completed-labs-tracker/issues/1) #1
- [Save local records in IndexedDB](https://github.com/chriskyfung/qwiklabs-completed-labs-tracker/issues/4) #4
- [Sync IndexedDB across computers](https://github.com/chriskyfung/qwiklabs-completed-labs-tracker/issues/7) #7

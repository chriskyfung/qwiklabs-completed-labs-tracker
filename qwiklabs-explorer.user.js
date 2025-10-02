// ==UserScript==
// @name         Qwiklabs Completed Labs Tracker
// @name:ja      Qwiklabsラボ完成トラッカー
// @namespace    https://chriskyfung.github.io/
// @version      3.0.0-alpha
// @author       chriskyfung
// @description  Label completed courses and labs on the Catalog page(s) and Lab pages on Google Cloud Skills Boost (https://www.cloudskillsboost.google/catalog)
// @homepage     https://chriskyfung.github.io/blog/qwiklabs/Userscript-for-Labelling-Completed-Qwiklabs
// @icon         https://raw.githubusercontent.com/chriskyfung/qwiklabs-completed-labs-tracker/master/icons/favicon-32x32.png
// @icon64       https://raw.githubusercontent.com/chriskyfung/qwiklabs-completed-labs-tracker/master/icons/favicon-64x64.png
// @updateURL    https://github.com/chriskyfung/qwiklabs-completed-labs-tracker/raw/master/qwiklabs-explorer.user.js
// @supportUrl   https://github.com/chriskyfung/qwiklabs-completed-labs-tracker/issues
// @match        https://*.cloudskillsboost.google/
// @match        https://*.cloudskillsboost.google/catalog*
// @match        https://*.cloudskillsboost.google/course_templates/*
// @match        https://*.cloudskillsboost.google/focuses/*
// @match        https://*.cloudskillsboost.google/quests/*
// @match        https://*.cloudskillsboost.google/profile/activity*
// @require      https://unpkg.com/dexie@4.2.0/dist/dexie.js
// ==/UserScript==

(function() {
  'use strict';

  const isDebugMode = false;
  const ACTIVITY_CARD_SELECTOR = 'ql-activity-card';
  const ACTIVITY_TABLE_SELECTOR = '.activities-table';
  const COURSE_PAGE_TITLE_SELECTOR = '.title-text';
  const LAB_PAGE_TITLE_SELECTOR = '.header__title';
  const SEARCH_RESULT_CONTAINER_SELECTOR = 'ql-search-result-container';

  const CLOUD_SKILLS_BOOST_BASE_URL = 'https://www.cloudskillsboost.google';

  const dbName = 'qwiklabs-db-test-1';
  const qdb = new Dexie(dbName);

  let tmpdb = {'labs': null, 'courses': null};

  /**
   * Initialize Database if not yet exist
   */
  async function initDB() {
    console.debug('initDB - start');
    //
    // Define database
    //
    qdb.version(2).stores({
      labs: '&id,name,status',
      courses: '&id,name,status',
    });
    console.debug('Using Dexie v' + Dexie.semVer);

    // Initial hardcoded data
    const initialData = {
      'labs': [
        {'id': 3563, 'name': 'Creating a Virtual Machine', 'status': ''},
        {'id': 563, 'name': 'Getting Started with Cloud Shell and gcloud', 'status': ''},
        {'id': 565, 'name': 'Provision Services with GCP Marketplace', 'status': ''},
        {'id': 1753, 'name': 'Creating a Persistent Disk', 'status': ''},
        {'id': 564, 'name': 'Hello Node Kubernetes', 'status': ''},
      ],
      'courses': [
        {'id': 621, 'name': 'Google Cloud Essentials', 'status': ''},
        {'id': 735, 'name': 'Google Developer Essentials', 'status': ''},
        {'id': 767, 'name': 'Optimize Your Google Cloud Costs', 'status': ''},
      ],
    };

    // Use the initial hardcoded data
    const qldata = initialData;

    // Query Database
    const lastLab = await qdb.labs.bulkAdd(qldata.labs);
    console.log(`Done adding ${qldata.labs.length} labs to the Dexie database`);
    console.log(`Last lab's id was: ${lastLab}`);
    const lastCourse = await qdb.courses.bulkAdd(qldata.courses);
    console.log(`Done adding ${qldata.courses.length} courses to the Dexie database`);
    console.log(`Last course's id was: ${lastCourse}`);
  }

  /**
   * Load Database when the Program Starts
   */
  async function loadDB() {
    if (!(await Dexie.exists(qdb.name))) {
      console.debug('qdb does not exist. Initialize a new database...');
      await initDB().catch(Dexie.BulkError, function(e) {
        // Explicitely catching the bulkAdd() operation makes those successful
        // additions commit despite that there were errors.
        console.error(e.failures.length + ' items did not succeed.');
      });
    }
    if (!qdb.isOpen()) {
      await qdb.open();
      if (isDebugMode) {
        console.log('qdb - set open');
        console.log('Found database: ' + qdb.name);
        console.log('Database version: ' + qdb.verno);
      }
    };
    //
    // Fetch Stored Data as Temporary Datasets
    //
    tmpdb.labs = await qdb.table('labs').toArray();
    tmpdb.courses = await qdb.table('courses').toArray();
  }

  /**
   * Create a new db record.
   * @param {Object} type - The type of the new record.
   * @param {number} id - The id of the new record.
   * @param {Object} obj - The object to store.
   * @return {Object} The new database object.
   */
  async function createRecord(type, id, obj) {
    obj.id = parseInt(id);
    const added = await qdb.table(type + 's').add(obj);
    if (added) {
      console.log(`Added a ${type} record with ${JSON.stringify(obj)} to the database.`);
    }
    return added;
  }

  /**
   * Update a single db record.
   * @param {Object} type - The type of the new record.
   * @param {number} id - The id of the new record.
   * @param {Object} obj - The object to store.
   * @return {Object} The updated database object.
   */
  async function updateRecordById(type, id, obj) {
    id = parseInt(id);
    const updated = await qdb.table(type + 's').update(id, obj);
    if (updated) {
      console.log(`Updated a ${type} record:${id} with ${JSON.stringify(obj)} to the database.`);
    }
    return updated;
  }

  /**
   * Shows a snackbar notification.
   * @param {object} options - The options for the snackbar.
   * @param {string} options.message - The message to display.
   * @param {string} [options.actionText] - The text for the action button.
   * @param {Function} [options.onAction] - The callback for the action button.
   * @param {number} [options.autoDismissDelay=10000] - Delay in ms to auto-dismiss.
   */
  function showSnackbar({message, actionText, onAction, autoDismissDelay = 10000}) {
    const snackbar = document.createElement('div');
    snackbar.id = 'snackbar';
    snackbar.classList.add('alert', 'alert--fake', 'js-alert', 'alert-success');
    // Apply Material Design styles
    Object.assign(snackbar.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 24px',
      color: '#FFFFFF',
      borderRadius: '4px',
      position: 'fixed',
      left: '50%',
      transform: 'translateX(-50%)',
      minWidth: '344px',
      maxWidth: '568px',
      zIndex: '1000',
    });

    const messageEl = document.createElement('p');
    messageEl.classList.add('alert__message', 'js-alert-message');
    messageEl.style.margin = '0';
    messageEl.style.flexGrow = '1';

    const actionEl = document.createElement('a');
    actionEl.classList.add('alert__close', 'js-alert-close');
    actionEl.href = '#'; // for accessibility
    actionEl.textContent = actionText || '✕';
    if (actionText) {
      messageEl.style.marginRight = '16px';
      Object.assign(actionEl.style, {
        fontWeight: 'bold',
        textTransform: 'uppercase',
        cursor: 'pointer',
      });
    } else {
      actionEl.style.cursor = 'pointer';
    }
    actionEl.addEventListener('click', (e) => {
      e.preventDefault();
      onAction ? onAction() : snackbar.remove();
    });

    messageEl.textContent = message;
    snackbar.appendChild(messageEl);
    snackbar.appendChild(actionEl);

    document.body.appendChild(snackbar);

    setTimeout(() => onAction ? onAction() : snackbar.remove(), autoDismissDelay);
  }

  /**
   * Batch update Activity records to the database.
   */
  const batchUpdateToDb = async () => {
    const newRecords = document.querySelector('button#db-update').data?.untrackedRecords;
    console.log('Batch Update - start');
    const count = {labs: 0, courses: 0};
    for (const newRecord of newRecords) {
      const id = newRecord.id;
      const type = newRecord.type;
      const tableName = type + 's';
      count[tableName] += 1;
      const updated = await qdb.table(tableName).where('id').equals(id).modify({'status': 'finished'});
      if (updated) {
        console.log(`Updated ${type}: {id: ${id}, name: '${newRecord.name}', 'status': 'finished'}`);
      }
    }
    console.log(`Number of items updated: ${count.courses} courses and ${count.labs} labs`);
    const nUpdate = count.labs + count.courses;

    if (nUpdate === 0) {
      showSnackbar({message: '0 items to update'});
    } else {
      let txt = '';
      txt += count.courses > 0 ? `${count.courses} course` : '';
      txt += (count.courses > 0 && count.labs > 0) ? ' and ' : '';
      txt += count.labs > 0 ? `${count.labs} lab` : '';
      txt += nUpdate > 1 ? ' records' : ' record';
      showSnackbar({
        message: `Updated ${txt}`,
        actionText: 'Refresh',
        onAction: () => location.reload(),
      });
    }
    console.log('Batch updated - finished');
  };

  /**
   * Standardize the string to be stored in the database
   * @param {string} title - A lab/course title
   * @return {string}
   */
  function formatTitle(title) {
    return title.replace(/:\S/g, ': ').replace(/\s\s+/g, ' ').trim();
  }

  /**
   * The function `getLabFromDbById` retrieves a lab record from a temporary database based on the
   * provided ID, handling errors and returning a default object if no record is found.
   * @param id - The `getLabFromDbById` function is an asynchronous function that takes an `id` parameter
   * as input. This function retrieves a lab record from a temporary database (`tmpdb`) based on the
   * provided `id`. If a matching record is found, it is returned. If no matching record is
   * @return The function `getLabFromDbById` is returning the lab record with the specified `id` from
   * the database. If a record with the given `id` is found, it will return that record. If no record is
   * found with the given `id`, it will return an object with a `status` property set to `null`. If an
   * error occurs during the process, it will log
   */
  async function getLabFromDbById(id) {
    const record = await tmpdb.labs.filter((record) => {
      return id == record.id;
    })[0];
    try {
      return record || {status: null};
    } catch (e) {
      // console.error (`${e}\nWhen handling lab id: "${id}"`);
      console.warn(`No lab record has an ID of ${id} in the database`);
      return null;
    }
  }

  /**
   * Retrieve a lab record from the database by passsing the title.
   * @param {string} title - A lab title.
   * @return {Object|null} A lab record or null if not found.
   */
  async function getLabFromDbByTitle(title) {
    const formattedTitle = formatTitle(title);
    const record = await tmpdb.labs.filter((record) => {
      return record.name == formattedTitle;
    })[0];
    try {
      return record || {status: null};
    } catch (e) {
      console.warn(`No lab record named "${title}" in the database`);
      return null;
    }
  }

  /**
   * Retrieve a lab record from the database by passsing the ID.
   * @param {number} id - A lab identifier.
   * @return {string|null} The lab status or null if not found.
   */
  async function getCourseFromDbById(id) {
    const record = await tmpdb.courses.filter((record) => {
      return id == record.id;
    })[0];
    try {
      return record || {status: null};
    } catch (e) {
      console.warn(`No course record has an ID of ${id} in the database`);
      return null;
    }
  }

  /**
   * Retrieve a course record from the database by passsing the title.
   * @param {string} title - A course title.
   * @return {Object|null} A course record or null if not found.
   */
  async function getCourseFromDbByTitle(title) {
    const formattedTitle = formatTitle(title);
    const record = await tmpdb.courses.filter((record) => {
      return record.name == formattedTitle;
    })[0];
    try {
      return record || {status: null};
    } catch (e) {
      console.warn(`No course record named "${title}" in the database`);
      return null;
    }
  }

  //
  // Annotation Methods
  //

  /**
    * Set the background color of an element by a predefined color key.
    * @param {Object} element - A DOM element
    * @param {string} colorKey - A key from colorMAP
    * @return {string} A hex color code from colorMAP
    */
  function setBackgroundColor(element, colorKey) {
    const colorMap = {
      'green': '#efe',
      'yellow': '#ffc',
      'purple': '#fef',
      'red': '#fdd',
    };
    if (colorKey in colorMap === false) {
      return null;
    };
    const color = colorMap[colorKey];
    element.style.background = color;
    return color;
  }

  /**
    * Set the background color of an element by a predefined color key.
    * @param {Object} element - A DOM element.
    * @param {string} iconKey - A key from iconMap.
    * @param {Object} options - The key of icon format to load,
    *           where 0 specifies for icon font and 1 for SVG image.
    * @return {string} The XML code of a SVG from iconMap.
    */
  function appendIcon(element, iconKey, options = {format_key: 0, elementType: 'p'}) {
    const formatKey = options.format_key;
    const elementType = options.elementType;
    const iconMap = {
      check: {
        0: '<i class="fas fa-check-circle" style="color:green"></i>',
        1: '<svg aria-hidden="true" focusable="false" data-icon="check-circle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16"><path fill="green" d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"></path></svg>',
      },
      game: {
        0: '<i class="fas fa-gamepad" style="color:purple"></i>',
        1: '<svg aria-hidden="true" focusable="false" data-icon="gamepad" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 -100 640 512" width="24" height="19"><path fill="purple" d="M480.07 96H160a160 160 0 1 0 114.24 272h91.52A160 160 0 1 0 480.07 96zM248 268a12 12 0 0 1-12 12h-52v52a12 12 0 0 1-12 12h-24a12 12 0 0 1-12-12v-52H84a12 12 0 0 1-12-12v-24a12 12 0 0 1 12-12h52v-52a12 12 0 0 1 12-12h24a12 12 0 0 1 12 12v52h52a12 12 0 0 1 12 12zm216 76a40 40 0 1 1 40-40 40 40 0 0 1-40 40zm64-96a40 40 0 1 1 40-40 40 40 0 0 1-40 40z"></path></svg>',
      },
      new: {
        0: '<i class="material-icons" style="color:orange">fiber_new</i>',
        1: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" width="24px" height="24px" fill="orange"><g><rect fill="none" height="24" width="24" x="0"/></g><g><g><g><path d="M20,4H4C2.89,4,2.01,4.89,2.01,6L2,18c0,1.11,0.89,2,2,2h16c1.11,0,2-0.89,2-2V6C22,4.89,21.11,4,20,4z M8.5,15H7.3 l-2.55-3.5V15H3.5V9h1.25l2.5,3.5V9H8.5V15z M13.5,10.26H11v1.12h2.5v1.26H11v1.11h2.5V15h-4V9h4V10.26z M20.5,14 c0,0.55-0.45,1-1,1h-4c-0.55,0-1-0.45-1-1V9h1.25v4.51h1.13V9.99h1.25v3.51h1.12V9h1.25V14z"/></g></g></g></svg>',
      },
      search: {
        0: '<i class="fas fa-search"></i>',
        1: '<svg aria-hidden="true" focusable="false" data-icon="search" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16"><path fill="#39c" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path></svg>',
      },
      warning: {
        0: '<i class="fas fa-exclamation-triangle"></i>',
        1: '<svg aria-hidden="true" focusable="false" data-icon="exclamation-triangle" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="18" height="16"><path fill="orange" d="M569.517 440.013C587.975 472.007 564.806 512 527.94 512H48.054c-36.937 0-59.999-40.055-41.577-71.987L246.423 23.985c18.467-32.009 64.72-31.951 83.154 0l239.94 416.028zM288 354c-25.405 0-46 20.595-46 46s20.595 46 46 46 46-20.595 46-46-20.595-46-46-46zm-43.673-165.346l7.418 136c.347 6.364 5.609 11.346 11.982 11.346h48.546c6.373 0 11.635-4.982 11.982-11.346l7.418-136c.375-6.874-5.098-12.654-11.982-12.654h-63.383c-6.884 0-12.356 5.78-11.981 12.654z"></path></svg>',
      },
    };
    if (iconKey in iconMap === false) {
      return null;
    };
    const icon = iconMap[iconKey][formatKey];
    const iconElement = document.createElement(elementType);
    iconElement.classList = 'qclt-icon';
    iconElement.setAttribute('aria-hidden', 'true');
    options.tooltip !== undefined && iconElement.setAttribute('title', options.tooltip);
    options.style && iconElement.setAttribute('style', options.style);
    options.beforeIcon && (iconElement.innerText = options.beforeIcon);
    iconElement.innerHTML += icon;
    element.append(iconElement);
    return icon;
  }

  /**
    * Scan through each activity card on a page, get the db record
    * by activity ID and label the recorded status on each card.
    */
  async function trackActivityCards(cards) {
    for (const card of cards) {
      // NOTE: This script relies on the internal structure of the ql-activity-card
      // web component. If the site updates this component, the selectors below
      // may break.
      if (!card.shadowRoot) {
        console.warn('No shadowRoot found for this card element. Skip it.');
        continue;
      }
      const params = {
        id: null,
        name: null,
        type: null,
      };
      if (card.attributes.length === 0) {
        const {href, title} = card.shadowRoot.firstElementChild.attributes;
        const type = card.shadowRoot.querySelector('.content-type').innerText.toLowerCase();
        params.id = href.value.match(/\/(\d+)/)[1];
        params.name = title.value;
        params.type = type;
      } else {
        params.id = card.getAttribute('path').match(/\/(\d+)/)[1];
        params.name = card.getAttribute('title');
        params.type = card.getAttribute('type').toLowerCase();
      }
      const cardTitle = card.shadowRoot.querySelector('h3');
      const options = {format_key: 1, elementType: 'span', style: 'margin-left: 4px'};
      switch (params.type) {
        case 'lab':
          const record = await getLabFromDbById(params.id);
          console.log(`Lab ID: ${params.id}, Title: "${params.name}", Record: ${JSON.stringify(record)}`);
          switch (record.status) {
            case 'finished':
              // Annotate as a Completed Lab
              appendIcon(cardTitle, 'check', options);
              continue;
              break;
            case null:
              // Append New Icon for unregistered Activity
              appendIcon(cardTitle, 'new', options);
              break;
          };
          break;
        case 'course':
          const courseRecord = await getCourseFromDbById(params.id);
          console.log(`Course ID: ${params.id}, Title: "${params.name}", Record: ${JSON.stringify(courseRecord)}`);
          switch (courseRecord.status) {
            case 'finished':
              // Annotate as a Completed course
              appendIcon(cardTitle, 'check', options);
              continue;
              break;
            case null:
              // Append New Icon for unregistered Activity
              appendIcon(cardTitle, 'new', options);
              break;
          };
          break;
        default:
          break;
      };
    };
  }

  /**
   * Label a lab page title based on the recorded status from the database.
   * @param {number} id - The id to query the record from the database.
   */
  async function trackTitleOnLabPage(id) {
    const labPageTitle = document.querySelector(LAB_PAGE_TITLE_SELECTOR);
    const h1 = labPageTitle.querySelector('h1');
    const title = h1.innerText;
    const options = {format_key: 1, elementType: 'span', style: 'margin-left: 4px'};
    const record = await getLabFromDbById(id);
    console.log(`Lab ID: ${id}, Title: "${title}", Record: ${JSON.stringify(record)}`);
    switch (record.status) {
      case 'finished':
        // Annotate as Completed
        setBackgroundColor(h1, 'green');
        appendIcon(labPageTitle, 'check', options);
        updateRecordById('lab', id, {'name': formatTitle(title)});
        break;
      case null:
        // Annotate as Unregistered;
        setBackgroundColor(h1, 'yellow');
        appendIcon(labPageTitle, 'new', options);
        createRecord('lab', id, {'name': formatTitle(title), 'status': ''});
        break;
    };
  }

  /**
   * Label a course page title based on the recorded status from the database.
   * @param {number} id - The id to query the record from the database.
   */
  async function trackTitleOnCoursePage(id) {
    const coursePageTitle = document.querySelector(COURSE_PAGE_TITLE_SELECTOR);
    const h1 = coursePageTitle.querySelector('h1');
    const title = h1.innerText;
    const options = {format_key: 1, elementType: 'span'};
    const courseRecord = await getCourseFromDbById(id);
    console.log(`Course ID: ${id}, Title: "${title}", Record: ${JSON.stringify(courseRecord)}`);
    switch (courseRecord.status) {
      case 'finished':
        // Annotate as Completed
        setBackgroundColor(h1, 'green');
        appendIcon(coursePageTitle, 'check', options);
        updateRecordById('course', id, {'name': formatTitle(title)});
        break;
      case null:
        // Annotate as Unregistered;
        setBackgroundColor(h1, 'yellow');
        appendIcon(coursePageTitle, 'new', options);
        createRecord('course', id, {'name': formatTitle(title), 'status': ''});
        break;
    };
  }

  /**
   * Extract ids from the title links and label the titles based on the
   * recorded status from the database.
   * @param {Object[]} titles - The DOM elements that contain lab/course titles.
   */
  async function trackListOfTitles(titles) {
    for (const title of titles) {
      const matches = title.innerHTML.match(/data-type="(.+)" \D+(\d+)/);
      if (matches == null) {
        continue;
      };
      const id = matches[2];
      const type = matches[1].toLowerCase();
      const options = {before: ' '};
      switch (type) {
        case 'lab':
          // tracking a lab on catalog page
          const record = await getLabFromDbById(id);
          console.log(`Lab ID: ${id}, Title: "${title}", Record: ${JSON.stringify(record)}`);
          switch (record.status) {
            case 'finished':
              // Annotate as a Completed Lab
              setBackgroundColor(title, 'green');
              appendIcon(title, 'check', options);
              continue;
              break;
            case null:
              // Annotate as Unregistered
              setBackgroundColor(title, 'yellow');
              appendIcon(title, 'new', options);
              break;
          };
          break;
        case 'course':
          // tracking a course on catalog page
          const courseRecord = await getCourseFromDbById(id);
          console.log(`Course ID: ${id}, Title: "${title}", Record: ${JSON.stringify(courseRecord)}`);
          switch (courseRecord.status) {
            case 'finished':
              // Annotate as a Completed Course
              setBackgroundColor(title, 'green');
              appendIcon(title, 'check', options);
              continue;
              break;
            case null:
              // Annotate as Unregistered
              setBackgroundColor(title, 'yellow');
              appendIcon(title, 'new', options);
              break;
          };
          break;
      };
    };
  }

  /**
    * Create the DOM element of the icon buton to run database update.
    * @param {Object} dataObj - A data object from trackActivities().
    * @return {Element} A button element for triggering database update.
    */
  const createUpdateButton = (dataObj) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'db-update';
    button.classList = 'db-update-button mdl-button mdl-button--icon' +
      ' mdl-button--primary mdl-js-button mdl-js-ripple-effect';
    button.title = 'Update Database Records';
    button.innerHTML = '<i class="material-icons">sync</i>';
    button.addEventListener('click', batchUpdateToDb);
    button.setAttribute('data-untracked-records', JSON.stringify(dataObj.data.untrackedRecords));
    button.setAttribute('data-unregistered-records', JSON.stringify(dataObj.data.unregisteredRecords));
    button.data = dataObj.data;
    button.disabled = dataObj.counts.untrackedRecords === 0;
    return button;
  };

  /**
   * Create a button group elememt.
   * Append an array of elements as the child elements of the button group.
   * @param {Element[]} children - The child elements.
   * @return {Element} The button group element.
   */
  const createButtonGroup = () => {
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'filter-group qclt-button-group';
    buttonGroup.style.cssText = 'margin-left: auto';
    return buttonGroup;
  };

  const createActivitesPagination = (onPage) => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const perPage = parseInt(params.get('per_page')) || 25;
    // params.set('per_page', 100);
    const currentPage = parseInt(params.get('page')) || 1;
    const pagination = document.createElement('div');
    pagination.className = 'pagination__navigation';
    if (currentPage == 1) {
      pagination.innerHTML = '<span class="previous_page disabled" aria-disabled="true">' +
        '<i class="material-icons" aria-label="Previous page">navigate_before</i></span>';
    } else {
      const previousPage = document.createElement('a');
      previousPage.className = 'previous_page';
      previousPage.rel = 'prev';
      params.set('page', currentPage - 1);
      url.search = params.toString();
      previousPage.href = url.toString();
      previousPage.innerHTML = '<i class="material-icons" aria-label="Previous page">navigate_before</i>';
      pagination.appendChild(previousPage);
    }
    if (perPage > onPage) {
      pagination.innerHTML += '<span class="next_page disabled" aria-disabled="true">' +
        '<i class="material-icons" aria-label="Next page">navigate_next</i></span>';
    } else {
      const nextPage = document.createElement('a');
      nextPage.className = 'next_page';
      nextPage.rel = 'next';
      params.set('page', currentPage + 1);
      url.search = params.toString();
      nextPage.href = url.toString();
      nextPage.innerHTML = '<i class="material-icons" aria-label="Next page">navigate_next</i>';
      pagination.appendChild(nextPage);
    }
    return pagination;
  };

  /**
   * Append a search link as the child of a givn element.
   * @param {Element} el - A DOM element.
   * @param {string} searchTerm - Search keywords.
   * @return {Element} An anchor link element.
   */
  const appendSeachLink = (el, searchTerm) => {
    const aTag = document.createElement('a');
    aTag.href = `${CLOUD_SKILLS_BOOST_BASE_URL}/catalog?keywords=${encodeURIComponent(searchTerm)}`;
    aTag.style.paddingLeft = '0.25em';
    el.appendChild(aTag);
    return aTag;
  };

  /**
    * Extract and handle the data from an Activities table on the Progress page
    * ('/profile/activity').
    * @return {Object[]} JSON-formatted data from the Activity table
    */
  const parseActivitiesOnProgressPage = () => {
    // Tracking tables under the My Learning section
    return document.querySelector(ACTIVITY_TABLE_SELECTOR)?.data || null;
  };

  /**
    * Track and annotate each activity row based on the data attributes and
    * the database records.
    * @param {Object[]} records - JSON-formatted data from the Activity table.
    * @return {number} Number of activity.
    */
  const trackAndAnnotateActivities = async (records) => {
    const staging = {
      untrackedRecords: [],
      unregisteredRecords: [],
    };
    const options = {format_key: 1, elementType: 'span'};
    const statusHandler = {
      // Annotate a record marked as finished in database
      'finished': (el, record, type) => {
        setBackgroundColor(el, 'green');
        el.classList.add(`completed-${type}`);
      },
      // Annotate a record not updated in database
      '': (el, record, type) => {
        setBackgroundColor(el, 'yellow');
        el.classList.add(`untracked-${type}`);
        staging.untrackedRecords.push({type, ...record});
      },
      // Annotate an unregistered record
      'null': (el, record, type) => {
        setBackgroundColor(el, 'yellow');
        const col1 = el.children[0];
        const searchIcon = appendSeachLink(col1, col1.innerText);
        appendIcon(searchIcon, 'search', {...options, tooltip: 'Search this activity'});
        appendIcon(col1, 'warning', {...options, before: ' ', tooltip: 'Unregistered activity'});
        el.classList.add(`new-${type}`);
        staging.unregisteredRecords.push({type, record});
      },
    };
    const typeHandler = (type) => {
      const handlerObj = {
        'lab': async (el, id, name, passed) => {
          const record = await getLabFromDbById(id);
          // || await getLabFromDbByTitle(name);
          const handler = statusHandler[record.status];
          if (passed) {
            handler(el, record || name, 'lab');
          } else {
            setBackgroundColor(el, 'red');
          }
          return record;
        },
        'course': async (el, id, name, passed) => {
          const record = await getCourseFromDbById(id);
          const handler = statusHandler[record.status];
          handler(el, record || name, 'course');
          return record;
        },
      };
      const dummyFunc = () => {
        return null;
      };
      return handlerObj[type] || dummyFunc;
    };
    const activityTable = document.querySelector(ACTIVITY_TABLE_SELECTOR);
    if (activityTable) {
      const rows = activityTable.shadowRoot.querySelectorAll('tbody > tr');
      for (const [i, record] of records.entries()) {
        /**
          Example of `record`:{
            "name": "<a href=\"/quizzes/409\">Quiz: Getting Started with Go</a>",
            "type": "<ql-activity-label activity=\"quiz\">Quiz: Getting Started with Go</ql-activity-label>",
            "started": "2020-01-01T00:00:00.000-00:00",
            "ended": "2020-01-01T00:01:00.000-00:00",
            "score": "Assessment 100.0%",
            "passed": true
          }
        */
        const type = record.type.match(/activity="(?<type>\w+)"/)?.groups?.type.toLowerCase() || 'unknown';
        const name = record.name.match(/>(?<name>[^<]+)</)?.groups?.name || record.name;
        const id = record.name.match(/\/\w+\/(?<id>\d+)/)?.groups?.id || null;
        const passed = record.passed;
        const row = rows[i];
        const handler = typeHandler(type);
        await handler(row, id, name, passed);
      };
      if (isDebugMode) {
        console.table(staging.untrackedRecords);
        console.table(staging.unregisteredRecords);
      }
      return {
        counts: {
          rows: rows.length,
          untrackedRecords: staging.untrackedRecords.length,
          unregisteredRecords: staging.unregisteredRecords.length,
        },
        data: {
          untrackedRecords: staging.untrackedRecords,
          unregisteredRecords: staging.unregisteredRecords,
        },
      };
    }
    return {
      counts: {
        rows: 0,
        untrackedRecords: 0,
        unregisteredRecords: 0,
      },
      data: {},
    };
  };

  /**
   * Select the handler for a specific URL path.
   * @param {string} path - A path name, e.g. '/', '/catalog'.
   * @return {Object} The handler object.
   */
  const router = (path) => {
    const matches = path.match(/^(?<route>\/\w+)\/(?<id>\d+)$/);
    const route = matches?.groups?.route || path;
    const id = matches?.groups?.id || null;
    const handler = {
      '/': {
        identifier: 'home',
        exec: async () => {
          console.debug('Tracking card data on Home');
          const cards = document.querySelectorAll(ACTIVITY_CARD_SELECTOR);
          await trackActivityCards(cards);
        },
      },
      '/catalog': {
        identifier: 'catalog',
        exec: async () => {
          console.debug('Tracking data on Catalog');
          const container = document.querySelector(SEARCH_RESULT_CONTAINER_SELECTOR);
          const cards = container.shadowRoot.querySelectorAll(ACTIVITY_CARD_SELECTOR);
          await trackActivityCards(cards);
        },
      },
      '/focuses': {
        identifier: 'lab',
        exec: async () => {
          console.debug('Tracking a lab page');
          await trackTitleOnLabPage(id);
        },
      },
      '/profile/activity': {
        identifier: 'activities',
        exec: async () => {
          console.debug('Tracking activity data on Profle');
          const activitiesData = parseActivitiesOnProgressPage();
          const results = await trackAndAnnotateActivities(activitiesData);
          // Create an Update button and a Pagination control
          const updateButton = createUpdateButton(results);
          updateButton.style.cssText = 'margin: auto 0 auto auto';
          const pagination = createActivitesPagination(results.counts.rows);
          pagination.style.cssText = 'margin: auto 12px auto 36px';
          // Append buttons to the button group on the top-right corner
          // of the Activities table
          const buttonGroup = createButtonGroup();
          buttonGroup.appendChild(updateButton);
          buttonGroup.appendChild(pagination);
          const activityFilters = document.querySelector('#learning_activity_search .filters');
          activityFilters.appendChild(buttonGroup);
        },
      },
      '/course_templates': {
        identifier: 'course',
        exec: async () => {
          console.debug('Tracking a course page');
          await trackTitleOnCoursePage(id);
          const titles = document.querySelectorAll('.catalog-item__title');
          await trackListOfTitles(titles);
        },
      },
    };
    return (route in handler) ? handler[route] : null;
  };

  /**
   * Main Function of the Tracking Program
   */
  async function main() {
    // Load database
    await loadDB();
    // Select process based on the URL path
    const url = new URL(window.location.href);
    const pathname = url.pathname;
    const handler = router(pathname);
    // Start processing DOM
    await handler?.exec();

    tmpdb = [];
    console.debug('Tracking - end');
  }

  //
  // Call and Catch the Main Function of the Program
  //
  main().catch((e) => {
    try {
      // Dexie.MissingAPIError
      if (e.name === 'MissingAPIError') {
        console.error('Dexie API is missing. Please make sure Dexie.js is loaded.');
      } else {
        console.error(e);
      }
    } catch (err) {
      console.error(err);
    }
  });
})();

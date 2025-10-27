// ==UserScript==
// @name         Qwiklabs Completed Labs Tracker
// @name:ja      Qwiklabsラボ完成トラッカー
// @namespace    https://chriskyfung.github.io/
// @version      3.2.0
// @author       chriskyfung
// @description  Label completed courses and labs on the Catalog page(s) and Lab pages on Google Skills (https://www.skills.google/catalog)
// @homepage     https://chriskyfung.github.io/blog/qwiklabs/Userscript-for-Labelling-Completed-Qwiklabs
// @icon         https://raw.githubusercontent.com/chriskyfung/qwiklabs-completed-labs-tracker/master/icons/favicon-32x32.png
// @icon64       https://raw.githubusercontent.com/chriskyfung/qwiklabs-completed-labs-tracker/master/icons/favicon-64x64.png
// @updateURL    https://github.com/chriskyfung/qwiklabs-completed-labs-tracker/raw/master/qwiklabs-explorer.user.js
// @supportUrl   https://github.com/chriskyfung/qwiklabs-completed-labs-tracker/issues
// @match        https://*.skills.google/
// @match        https://*.skills.google/catalog*
// @match        https://*.skills.google/course_templates/*
// @match        https://*.skills.google/focuses/*
// @match        https://*.skills.google/quests/*
// @match        https://*.skills.google/profile/activity*
// @require      https://unpkg.com/dexie@4.2.0/dist/dexie.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const CONFIG = {
    isDebugMode: false,
    dbName: 'qwiklabs-db-test-1',
    selectors: {
      activityCard: 'ql-activity-card',
      activityTable: '.activities-table',
      coursePageTitle: '.top-title',
      labPageTitle: '.lab-preamble',
      searchResultContainer: 'ql-search-result-container',
    },
    urls: {
      cloudSkillsBoost: 'https://www.skills.google',
    },
  };
  const db = new Dexie(CONFIG.dbName);

  // In-memory cache for database tables to reduce DB queries.
  let databaseCache = { labs: null, courses: null };

  /**
   * Initializes the Dexie database with tables and initial data if it doesn't exist.
   */
  async function initDB() {
    console.debug('initDB - start');
    // Define database schema.
    db.version(2).stores({
      labs: '&id,name,status',
      courses: '&id,name,status',
    });
    console.debug('Using Dexie v' + Dexie.semVer);

    // These are for demonstration and testing purposes.
    const initialData = {
      labs: [
        { id: 3563, name: 'Creating a Virtual Machine', status: '' },
        {
          id: 563,
          name: 'Getting Started with Cloud Shell and gcloud',
          status: '',
        },
        {
          id: 565,
          name: 'Provision Services with GCP Marketplace',
          status: '',
        },
        { id: 1753, name: 'Creating a Persistent Disk', status: '' },
        { id: 564, name: 'Hello Node Kubernetes', status: '' },
      ],
      courses: [
        { id: 621, name: 'Google Cloud Essentials', status: '' },
        { id: 735, name: 'Google Developer Essentials', status: '' },
        { id: 767, name: 'Optimize Your Google Cloud Costs', status: '' },
      ],
    };

    // Populate the database with initial data.
    const qldata = initialData;

    const lastLab = await db.labs.bulkAdd(qldata.labs);
    console.log(`Done adding ${qldata.labs.length} labs to the Dexie database`);
    console.log(`Last lab's id was: ${lastLab}`);
    const lastCourse = await db.courses.bulkAdd(qldata.courses);
    console.log(
      `Done adding ${qldata.courses.length} courses to the Dexie database`
    );
    console.log(`Last course's id was: ${lastCourse}`);
  }

  /**
   * Loads the database and caches its tables into memory.
   * Initializes the database if it doesn't exist.
   */
  async function loadDB() {
    if (!(await Dexie.exists(db.name))) {
      console.debug('Database does not exist. Initializing a new one...');
      await initDB().catch(Dexie.BulkError, function (e) {
        // Log errors for failed additions, but commit successful ones.
        console.error(e.failures.length + ' items did not succeed.');
      });
    }
    if (!db.isOpen()) {
      await db.open();
      if (CONFIG.isDebugMode) {
        console.log('Database opened: ' + db.name);
        console.log('Database version: ' + db.verno);
      }
    }
    // Cache the entire tables into memory for faster access.
    databaseCache.labs = await db.table('labs').toArray();
    databaseCache.courses = await db.table('courses').toArray();
  }

  /**
   * Creates a new record in the specified database table.
   * @param {string} type - The type of record ('lab' or 'course').
   * @param {number} id - The unique identifier for the record.
   * @param {Object} data - The data to be stored.
   * @return {Promise<number>} The id of the newly created record.
   */
  async function createRecord(type, id, data) {
    data.id = parseInt(id);
    const added = await db.table(type + 's').add(data);
    if (added) {
      console.log(
        `Added a ${type} record with ${JSON.stringify(data)} to the database.`
      );
    }
    return added;
  }

  /**
   * Updates a single record in the database by its ID.
   * @param {string} type - The type of record ('lab' or 'course').
   * @param {number} id - The ID of the record to update.
   * @param {Object} data - An object containing the properties to update.
   * @return {Promise<number>} A promise that resolves with the number of updated records (0 or 1).
   */
  async function updateRecordById(type, id, data) {
    id = parseInt(id);
    const updated = await db.table(type + 's').update(id, data);
    if (updated) {
      console.log(
        `Updated a ${type} record:${id} with ${JSON.stringify(data)} to the database.`
      );
    }
    return updated;
  }

  /**
   * Batch creates new records in the database from an array of records.
   * @param {Array} records - Array of records to be created, each with a type and record data.
   */
  async function batchCreateRecords(records) {
    const newRecordsByType = records.reduce((acc, { type, record }) => {
      const tableName = `${type}s`;
      if (!acc[tableName]) {
        acc[tableName] = [];
      }
      acc[tableName].push(record);
      return acc;
    }, {});

    for (const tableName in newRecordsByType) {
      if (Object.prototype.hasOwnProperty.call(newRecordsByType, tableName)) {
        const newRecordsArray = newRecordsByType[tableName];
        if (newRecordsArray.length > 0) {
          try {
            const lastKey = await db.table(tableName).bulkAdd(newRecordsArray);
            console.log(
              `Bulk added ${newRecordsArray.length} new records to ${tableName}. Last key: ${lastKey}.`
            );
          } catch (e) {
            console.error(`Error bulk adding to ${tableName}:`, e);
          }
        }
      }
    }
  }

  /**
   * Batch updates records in the database from an array of records.
   * @param {Array} records - Array of records to be updated.
   * @return {Promise<Object>} An object with counts of updated labs and courses.
   */
  async function batchUpdateRecords(records) {
    console.log('Batch Update - start', records);
    const labsToUpdate = records
      .filter((r) => r.type === 'lab')
      .map((r) => ({ ...r, status: 'finished' }));
    const coursesToUpdate = records
      .filter((r) => r.type === 'course')
      .map((r) => ({ ...r, status: 'finished' }));

    if (labsToUpdate.length > 0) {
      await db.table('labs').bulkPut(labsToUpdate);
    }
    if (coursesToUpdate.length > 0) {
      await db.table('courses').bulkPut(coursesToUpdate);
    }

    console.log(
      `Number of items updated: ${coursesToUpdate.length} courses and ${labsToUpdate.length} labs`
    );
    return { labs: labsToUpdate.length, courses: coursesToUpdate.length };
  }

  /**
   * Shows a snackbar notification at the top of the page.
   * @param {object} options - The options for the snackbar.
   * @param {string} options.message - The message to display.
   * @param {string} [options.actionText] - The text for the action button.
   * @param {Function} [options.onAction] - The callback for when the action button is clicked.
   * @param {number} [options.autoDismissDelay=10000] - Delay in milliseconds to auto-dismiss the snackbar.
   */
  function showSnackbar({
    message,
    actionText,
    onAction,
    autoDismissDelay = 10000,
  }) {
    const snackbar = document.createElement('div');
    snackbar.id = 'snackbar';
    snackbar.classList.add('alert', 'alert--fake', 'js-alert', 'alert-success');
    // Using Material Design-like styles for the snackbar.
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
    actionEl.href = '#'; // Necessary for accessibility.
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

    setTimeout(
      () => (onAction ? onAction() : snackbar.remove()),
      autoDismissDelay
    );
  }

  /**
   * Batch updates the status of untracked activity records to 'finished' in the database.
   */
  const batchUpdateToDb = async () => {
    const updateButton = document.querySelector('button#db-update');
    if (!updateButton) {
      console.error('Update button not found.');
      return;
    }
    const untrackedRecordsJSON = updateButton.dataset.untrackedRecords;
    const recordsToUpdate = untrackedRecordsJSON
      ? JSON.parse(untrackedRecordsJSON)
      : [];
    if (!recordsToUpdate || recordsToUpdate.length === 0) {
      console.warn('No untracked records found to update.');
      showSnackbar({ message: '0 items to update' });
      return;
    }

    const counts = await batchUpdateRecords(recordsToUpdate);

    const totalUpdates = counts.labs + counts.courses;

    if (totalUpdates === 0) {
      showSnackbar({ message: '0 items to update' });
    } else {
      let notificationText = '';
      notificationText += counts.courses > 0 ? `${counts.courses} course` : '';
      notificationText += counts.courses > 0 && counts.labs > 0 ? ' and ' : '';
      notificationText += counts.labs > 0 ? `${counts.labs} lab` : '';
      notificationText += totalUpdates > 1 ? ' records' : ' record';
      showSnackbar({
        message: `Updated ${notificationText}`,
        actionText: 'Refresh',
        onAction: () => location.reload(),
      });
    }
    console.log('Batch updated - finished');
  };

  /**
   * Standardizes a title string by correcting spacing after colons and removing extra spaces.
   * @param {string} title - The lab or course title.
   * @return {string} The formatted title.
   */
  function formatTitle(title) {
    return title.replace(/:\S/g, ': ').replace(/\s\s+/g, ' ').trim();
  }

  /**
   * Retrieves a lab record from the cache by its ID.
   * @param {number} id - The ID of the lab to retrieve.
   * @return {Object} The lab record, or an object with a null status if not found.
   */
  async function getLabFromDbById(id) {
    return databaseCache.labs.find((record) => id == record.id) || { status: null };
  }

  /**
   * Retrieves a course record from the cache by its ID.
   * @param {number} id - The ID of the course.
   * @return {Object} The course record, or an object with a null status if not found.
   */
  function getCourseFromDbById(id) {
    return databaseCache.courses.find((record) => id == record.id) || { status: null };
  }

  //
  // Annotation Methods
  //

  /**
   * Sets the background color of a DOM element.
   * @param {HTMLElement} element - The DOM element to style.
   * @param {string} colorKey - A key from the internal colorMap (e.g., 'green', 'yellow').
   * @return {string|null} The hex color code if the key is valid, otherwise null.
   */
  function setBackgroundColor(element, colorKey) {
    const colorMap = {
      darkGreen: '#008000',
      darkOrange: '#ff8c00',
      green: '#efe',
      yellow: '#ffc',
      purple: '#fef',
      red: '#fdd',
    };
    if (!(colorKey in colorMap)) {
      return null;
    }
    const color = colorMap[colorKey];
    element.style.background = color;
    return color;
  }

  /**
   * Appends a status icon to a DOM element.
   * @param {HTMLElement} element - The DOM element to append the icon to.
   * @param {string} iconKey - A key from the internal iconMap (e.g., 'check', 'new').
   * @param {Object} [options={format_key: 0, elementType: 'p'}] - Options for the icon.
   * @return {string|null} The SVG/HTML string of the icon if the key is valid, otherwise null.
   */
  function appendIcon(
    element,
    iconKey,
    options = {
      format_key: 0,
      elementType: 'p',
    }
  ) {
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
    if (!(iconKey in iconMap)) {
      return null;
    }
    const icon = iconMap[iconKey][formatKey];
    const iconElement = document.createElement(elementType);
    iconElement.classList = 'qclt-icon';
    iconElement.setAttribute('aria-hidden', 'true');
    options.tooltip !== undefined &&
      iconElement.setAttribute('title', options.tooltip);
    options.style && iconElement.setAttribute('style', options.style);
    options.beforeIcon && (iconElement.innerText = options.beforeIcon);
    iconElement.innerHTML += icon;
    element.append(iconElement);
    return icon;
  }

  /**
   * Scans through activity cards on the page, retrieves completion status from the database,
   * and annotates the cards accordingly.
   * @param {NodeListOf<Element>} cards - A list of ql-activity-card elements.
   */
  async function trackActivityCards(cards) {
    for (const card of cards) {
      // This script relies on the internal structure of the ql-activity-card
      // web component. If the site updates this component, the selectors below may break.
      if (!card.shadowRoot) {
        console.warn('No shadowRoot found for this card element. Skipping.');
        continue;
      }
      const params = {
        id: null,
        name: null,
        type: null,
      };
      // The card component has two structures, one with attributes on the host
      // and one with attributes on the first child of the shadowRoot.
      if (card.attributes.length === 0) {
        const { href, title } = card.shadowRoot.firstElementChild.attributes;
        const type = card.shadowRoot
          .querySelector('ql-activity-label')
          .getAttribute('activity')
          .toLowerCase();
        params.id = href.value.match(/\/(\d+)/)[1];
        params.name = title.value;
        params.type = type;
      } else {
        params.id = card.getAttribute('path').match(/\/(\d+)/)[1];
        params.name = card.getAttribute('title');
        params.type = card.getAttribute('type').toLowerCase();
      }
      const cardTitle = card.shadowRoot.querySelector('h3');
      const options = {
        format_key: 1,
        elementType: 'span',
        style: 'margin-left: 4px',
      };
      switch (params.type) {
        case 'lab':
          const record = await getLabFromDbById(params.id);
          console.log(
            `Lab ID: ${params.id}, Title: "${params.name}", Record: ${JSON.stringify(record)}`
          );
          switch (record.status) {
            case 'finished':
              appendIcon(cardTitle, 'check', options);
              break;
            case null:
              appendIcon(cardTitle, 'new', options);
              break;
          }
          break;
        case 'course':
          const courseRecord = await getCourseFromDbById(params.id);
          console.log(
            `Course ID: ${params.id}, Title: "${params.name}", Record: ${JSON.stringify(courseRecord)}`
          );
          switch (courseRecord.status) {
            case 'finished':
              appendIcon(cardTitle, 'check', options);
              break;
            case null:
              appendIcon(cardTitle, 'new', options);
              break;
          }
          break;
        default:
          break;
      }
    }
  }

  /**
   * Annotates the title on a detail page (lab or course) based on its completion status.
   * @param {string} type - The type of detail page ('lab' or 'course').
   * @param {number} id - The ID of the lab or course.
   */
  async function trackTitleOnDetailPage(type, id) {
    const isLab = type === 'lab';
    const selector = isLab ? CONFIG.selectors.labPageTitle : CONFIG.selectors.coursePageTitle;
    const pageTitleEl = document.querySelector(selector);
    if (!pageTitleEl) {
      console.warn(`Element '${selector}' not found.`);
      return;
    }
    const h1 = pageTitleEl.querySelector('h1');
    if (!h1) {
      console.warn(`h1 not found in '${selector}'.`);
      return;
    }
    const title = h1.innerText;
    const getRecord = isLab ? getLabFromDbById : getCourseFromDbById;
    const record = await getRecord(id);

    const options = {
      format_key: 1,
      elementType: 'span',
      style: isLab ? 'display: inline-block; vertical-align:super;' : '',
    };

    console.log(`${type} ID: ${id}, Title: "${title}", Record: ${JSON.stringify(record)}`);

    switch (record.status) {
      case 'finished':
        setBackgroundColor(h1, isLab ? 'green' : 'darkGreen');
        appendIcon(isLab ? h1 : pageTitleEl, 'check', options);
        updateRecordById(type, id, { name: formatTitle(title) });
        break;
      case null:
        setBackgroundColor(h1, isLab ? 'yellow' : 'darkOrange');
        appendIcon(isLab ? h1 : pageTitleEl, 'new', options);
        createRecord(type, id, { name: formatTitle(title), status: '' });
        break;
    }
  }

  /**
   * Annotates a list of titles (e.g., in a catalog) based on their completion status.
   * @param {NodeListOf<Element>} titles - A list of DOM elements containing titles.
   */
  async function trackListOfTitles(titles) {
    for (const title of titles) {
      const matches = title.innerHTML.match(/data-type="(.+)" \D+(\d+)/);
      if (matches == null) {
        continue;
      }
      const id = matches[2];
      const type = matches[1].toLowerCase();
      const options = { beforeIcon: ' ' };
      switch (type) {
        case 'lab':
          const record = await getLabFromDbById(id);
          console.log(
            `Lab ID: ${id}, Title: "${title}", Record: ${JSON.stringify(record)}`
          );
          switch (record.status) {
            case 'finished':
              setBackgroundColor(title, 'green');
              appendIcon(title, 'check', options);
              break;
            case null:
              setBackgroundColor(title, 'yellow');
              appendIcon(title, 'new', options);
              break;
          }
          break;
        case 'course':
          const courseRecord = await getCourseFromDbById(id);
          console.log(
            `Course ID: ${id}, Title: "${title}", Record: ${JSON.stringify(courseRecord)}`
          );
          switch (courseRecord.status) {
            case 'finished':
              setBackgroundColor(title, 'green');
              appendIcon(title, 'check', options);
              break;
            case null:
              setBackgroundColor(title, 'yellow');
              appendIcon(title, 'new', options);
              break;
          }
          break;
      }
    }
  }

  /**
   * Creates the "Update Database" button.
   * @param {Object} activityData - Data object from trackAndAnnotateActivities.
   * @return {HTMLButtonElement} A button element for triggering the database update.
   */
  const createUpdateButton = (activityData) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'db-update';
    button.classList =
      'db-update-button mdl-button mdl-button--icon' +
      ' mdl-button--primary mdl-js-button mdl-js-ripple-effect';
    button.title = 'Update Database Records';
    const icon = document.createElement('i');
    icon.className = 'material-icons';
    icon.textContent = 'sync';
    button.appendChild(icon);
    button.addEventListener('click', batchUpdateToDb);
    button.dataset.untrackedRecords = JSON.stringify(
      activityData.data.untrackedRecords
    );
    button.dataset.unregisteredRecords = JSON.stringify(
      activityData.data.unregisteredRecords
    );
    button.disabled = activityData.counts.untrackedRecords === 0;
    return button;
  };

  /**
   * Creates a button group container.
   * @return {HTMLDivElement} The button group element.
   */
  const createButtonGroup = () => {
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'filter-group qclt-button-group';
    buttonGroup.style.cssText = 'margin-left: auto';
    return buttonGroup;
  };

  /**
   * Creates pagination controls for the activities page.
   * @param {number} onPage - The number of items currently displayed on the page.
   * @return {HTMLDivElement} The pagination container element.
   */
  const createActivitesPagination = (onPage) => {
    const defaultPerPage = 25;
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const perPage = parseInt(params.get('per_page')) || 25;
    const currentPage = parseInt(params.get('page')) || 1;
    const pagination = document.createElement('div');
    pagination.className = 'pagination__navigation';

    const createIcon = (label, content) => {
      const icon = document.createElement('i');
      icon.className = 'material-icons';
      icon.setAttribute('aria-label', label);
      icon.textContent = content;
      return icon;
    };

    const updatePaginationLinks = (newPerPage) => {
      const newParams = new URLSearchParams(params);
      if (newPerPage !== defaultPerPage) {
 newParams.set('per_page', newPerPage);
      } else {
 newParams.delete('per_page');
      }
    };
    if (currentPage == 1) {
      const prevSpan = document.createElement('span');
      prevSpan.className = 'previous_page disabled';
      prevSpan.setAttribute('aria-disabled', 'true');
      prevSpan.appendChild(createIcon('Previous page', 'navigate_before'));
      pagination.appendChild(prevSpan);
    } else {
      const previousPage = document.createElement('a');
      previousPage.className = 'previous_page';
      previousPage.rel = 'prev';
      const newParams = new URLSearchParams(params);
      newParams.set('page', currentPage - 1);
      if (perPage !== defaultPerPage) {
 newParams.set('per_page', perPage);
      }
      const newUrl = new URL(url);
      newUrl.search = newParams.toString();
      previousPage.href = newUrl.toString();
      previousPage.appendChild(createIcon('Previous page', 'navigate_before'));
      pagination.appendChild(previousPage);
    }

    if (perPage > onPage) {
      const nextSpan = document.createElement('span');
      nextSpan.className = 'next_page disabled';
      nextSpan.setAttribute('aria-disabled', 'true');
      nextSpan.appendChild(createIcon('Next page', 'navigate_next'));
      pagination.appendChild(nextSpan);
    } else {
      const nextPage = document.createElement('a');
      nextPage.className = 'next_page';
      nextPage.rel = 'next';
      const newParams = new URLSearchParams(params);
      newParams.set('page', currentPage + 1);
      if (perPage !== defaultPerPage) {
 newParams.set('per_page', perPage);
      }
      const newUrl = new URL(url);
      newUrl.search = newParams.toString();
      nextPage.href = newUrl.toString();
      nextPage.appendChild(createIcon('Next page', 'navigate_next'));
      pagination.appendChild(nextPage);
    }

    // Per page dropdown
    const perPageDropdown = document.createElement('select');
    perPageDropdown.className = 'per-page-dropdown';
    perPageDropdown.style.cssText = 'font-size: 14px; margin-left: 10px; border-radius: 8px; height: auto;';
    const perPageOptions = [25, 50, 100, 200];
    perPageOptions.forEach((optionValue) => {
      const option = document.createElement('option');
      option.value = optionValue;
      option.textContent = `${optionValue} per page`;
      if (optionValue === perPage) {
 option.selected = true;
      }
      perPageDropdown.appendChild(option);
    });

    perPageDropdown.addEventListener('change', (event) => {
      const newPerPage = parseInt(event.target.value);
      const newParams = new URLSearchParams(params);
      newParams.set('page', 1); // Reset to first page when changing per_page
      if (newPerPage !== defaultPerPage) {
 newParams.set('per_page', newPerPage);
      } else {
 newParams.delete('per_page');
      }
      window.location.search = newParams.toString();
    });
    pagination.append(perPageDropdown);
    return pagination;
  };

  /**
   * Creates and appends a search link to an element.
   * @param {HTMLElement} element - The DOM element to append the link to.
   * @param {string} searchTerm - The search query.
   * @return {HTMLAnchorElement} The created anchor element.
   */
  const appendSeachLink = (element, searchTerm) => {
    const aTag = document.createElement('a');
    aTag.href = `${CONFIG.urls.cloudSkillsBoost}/catalog?keywords=${encodeURIComponent(searchTerm)}`;
    aTag.style.paddingLeft = '0.25em';
    element.appendChild(aTag);
    return aTag;
  };

  /**
   * Parses the activity data from the table on the user's profile activity page.
   * @return {Object[]|null} An array of activity data objects, or null if the table is not found.
   */
  const parseActivitiesOnProgressPage = () => {
    // The activity data is conveniently stored on the table element's `data` property.
    return document.querySelector(CONFIG.selectors.activityTable)?.data || null;
  };

  /**
   * Tracks and annotates each row in the activities table based on database records.
   * @param {Object[]} records - An array of activity data from the page.
   * @return {Promise<Object>} An object containing counts and data for untracked/unregistered records.
   */
  const trackAndAnnotateActivities = async (records) => {
    const staging = {
      untrackedRecords: [],
      unregisteredRecords: [],
    };
    const options = {
      format_key: 1,
      elementType: 'span',
    };

    // Handlers for different completion statuses.
    const statusHandler = {
      finished: (rowElement, record, type) => {
        setBackgroundColor(rowElement, 'green');
        rowElement.classList.add(`completed-${type}`);
      },
      '': (rowElement, record, type) => {
        setBackgroundColor(rowElement, 'yellow');
        rowElement.classList.add(`untracked-${type}`);
        staging.untrackedRecords.push({ type, ...record });
      },
      null: (rowElement, record, type, id, name) => {
        setBackgroundColor(rowElement, 'yellow');
        const col1 = rowElement.children[0];
        appendIcon(col1, 'warning', {
          ...options,
          beforeIcon: ' ',
          tooltip: 'Unregistered activity',
        });
        if (!col1.querySelector('a')) {
          const searchIcon = appendSeachLink(col1, col1.innerText);
          appendIcon(searchIcon, 'search', {
            ...options,
            tooltip: 'Search this activity',
          });
        }
        rowElement.classList.add(`new-${type}`);
        const newRecord = {
          id: parseInt(id),
          name: formatTitle(name),
          status: '',
        };
        staging.unregisteredRecords.push({ type, record: newRecord });
      },
    };

    // Handlers for different activity types (lab, course, etc.).
    const activityTypeHandler = (type) => {
      const handlers = {
        lab: async (rowElement, id, name, isPassed) => {
          const record = await getLabFromDbById(id);
          const statusUpdateHandler = statusHandler[record.status];
          if (isPassed && statusUpdateHandler) {
            statusUpdateHandler(rowElement, record, 'lab', id, name);
          } else {
            setBackgroundColor(rowElement, 'red');
          }
          return record;
        },
        course: async (rowElement, id, name, isPassed) => {
          const record = await getCourseFromDbById(id);
          const statusUpdateHandler = statusHandler[record.status];
          if (statusUpdateHandler && (isPassed || isPassed === null)) {
            statusUpdateHandler(rowElement, record, 'course', id, name);
          } else {
            setBackgroundColor(rowElement, 'yellow');          
          }
          return record;
        },
      };
      return handlers[type] || (() => null); // Return a dummy function for unknown types.
    };

    const activityTable = document.querySelector(CONFIG.selectors.activityTable);
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
        const type =
          record.type
            .match(/activity="(?<type>\w+)"/)
            ?.groups?.type.toLowerCase() || 'unknown';
        const name =
          record.name.match(/>(?<name>[^<]+)</)?.groups?.name || record.name;
        const id = record.name.match(/\/\w+\/(?<id>\d+)/)?.groups?.id || null;
        const passed = record.passed;
        const row = rows[i];
        const handler = activityTypeHandler(type);
        await handler(row, id, name, passed);
      }

      await batchCreateRecords(staging.unregisteredRecords);

      if (CONFIG.isDebugMode) {
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
      counts: { rows: 0, untrackedRecords: 0, unregisteredRecords: 0 },
      data: {},
    };
  };

  /**
   * Determines which function to run based on the current URL path.
   * @param {string} path - The path name from the URL (e.g., '/', '/catalog').
   * @return {Object|null} The handler object for the current route, or null if no match.
   */
  const router = (path) => {
    const matches = path.match(/^(?<route>\/\w+)\/(?<id>\d+)$/);
    const route = matches?.groups?.route || path;
    const id = matches?.groups?.id || null;
    const handlers = {
      '/': {
        identifier: 'home',
        exec: async () => {
          console.debug('Tracking card data on Home');
          const cards = document.querySelectorAll(CONFIG.selectors.activityCard);
          await trackActivityCards(cards);
        },
      },
      '/catalog': {
        identifier: 'catalog',
        exec: async () => {
          console.debug('Tracking data on Catalog');
          const container = document.querySelector(
            CONFIG.selectors.searchResultContainer
          );
          if (container && container.shadowRoot) {
            const cards = container.shadowRoot.querySelectorAll(
              CONFIG.selectors.activityCard
            );
            await trackActivityCards(cards);
          } else {
            console.warn(
              `Element '${CONFIG.selectors.searchResultContainer}' not found or has no shadowRoot.`
            );
          }
        },
      },
      '/focuses': {
        identifier: 'lab',
        exec: async () => {
          console.debug('Tracking a lab page');
          await trackTitleOnDetailPage('lab', id);
        },
      },
      '/profile/activity': {
        identifier: 'activities',
        exec: async () => {
          console.debug('Tracking activity data on Profile');
          const activitiesData = parseActivitiesOnProgressPage();
          const results = await trackAndAnnotateActivities(activitiesData);
          // Add UI elements for batch updating and pagination.
          const updateButton = createUpdateButton(results);
          updateButton.style.cssText = 'margin: auto 0 auto auto';
          const pagination = createActivitesPagination(results.counts.rows);
          pagination.style.cssText = 'margin: auto 12px auto 36px';

          const buttonGroup = createButtonGroup();
          buttonGroup.appendChild(updateButton);
          buttonGroup.appendChild(pagination);
          const activityFilters = document.querySelector(
            '#learning_activity_search .filters'
          );
          if (activityFilters) {
            activityFilters.appendChild(buttonGroup);
          } else {
            console.warn(
              "Element '#learning_activity_search .filters' not found."
            );
          }
        },
      },
      '/course_templates': {
        identifier: 'course',
        exec: async () => {
          console.debug('Tracking a course page');
          await trackTitleOnDetailPage('course', id);
          const titles = document.querySelectorAll('.catalog-item__title');
          await trackListOfTitles(titles);
        },
      },
    };
    return route in handlers ? handlers[route] : null;
  };

  /**
   * Main function for the userscript.
   */
  async function main() {
    await loadDB();
    const url = new URL(window.location.href);
    const routeHandler = router(url.pathname);
    if (routeHandler) {
      await routeHandler.exec();
    }
    databaseCache = {}; // Clear cache after use.
    console.debug('Tracking - end');
  }

  // Run the main function and catch any errors.
  main().catch((e) => {
    try {
      if (e.name === 'MissingAPIError') {
        console.error(
          'Dexie API is missing. Please make sure Dexie.js is loaded.'
        );
      } else {
        console.error(e);
      }
    } catch (err) {
      console.error(err);
    }
  });
})();

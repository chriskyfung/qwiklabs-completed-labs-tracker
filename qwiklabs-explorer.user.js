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

  /**
   * ----------------------------------------------------------------
   * CONFIGURATION
   * @namespace Config
   * ----------------------------------------------------------------
   */
  const Config = {
    /** @type {boolean} */
    isDebugMode: false,
    /** @type {string} */
    dbName: 'qwiklabs-db-test-1',
    /** @type {Object.<string, string>} */
    selectors: {
      activityCard: 'ql-activity-card',
      activityTable: '.activities-table',
      coursePageTitle: '.top-title',
      labPageTitle: '.lab-preamble',
      searchResultContainer: 'ql-search-result-container',
      updateButton: '#db-update',
      activityFilters: '#learning_activity_search .filters',
      catalogItemTitle: '.catalog-item__title',
      activityTableRow: 'tbody > tr',
      activityLabel: 'ql-activity-label',
      anchor: 'a',
      h1: 'h1',
      h3: 'h3',
    },
    /** @type {Object.<string, string>} */
    urls: {
      cloudSkillsBoost: 'https://www.skills.google',
    },
    /** @type {Object.<string, (string|string[])>} */
    cssClasses: {
      updateButton:
        'db-update-button mdl-button mdl-button--icon' +
        ' mdl-button--primary mdl-js-button mdl-js-ripple-effect',
      paginationNav: 'pagination__navigation',
      buttonGroup: 'filter-group qclt-button-group',
      perPageDropdown: 'per-page-dropdown',
      materialIcons: 'material-icons',
      qcltIcon: 'qclt-icon',
      snackbar: ['alert', 'alert--fake', 'js-alert', 'alert-success'],
      snackbarMessage: ['alert__message', 'js-alert-message'],
      snackbarClose: ['alert__close', 'js-alert-close'],
      completedLab: 'completed-lab',
      completedCourse: 'completed-course',
      untrackedLab: 'untracked-lab',
      untrackedCourse: 'untracked-course',
      newLab: 'new-lab',
      newCourse: 'new-course',
    },
    /** @type {{defaultPerPage: number, perPageOptions: number[]}} */
    pagination: {
      defaultPerPage: 25,
      perPageOptions: [25, 50, 100, 200],
    },
    /** @type {Object.<string, string>} */
    colors: {
      darkGreen: '#008000',
      darkOrange: '#ff8c00',
      green: '#efe',
      yellow: '#ffc',
      purple: '#fef',
      red: '#fdd',
    },
    /** @type {Object.<string, Object.<number, string>>} */
    icons: {
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
    },
  };

  /**
   * ----------------------------------------------------------------
   * DATABASE MODULE
   * @namespace Database
   * ----------------------------------------------------------------
   */
  const Database = (function () {
    const db = new Dexie(Config.dbName);
    /** @type {{labs: Object[]|null, courses: Object[]|null}} */
    let cache = { labs: null, courses: null };

    /**
     * Gets the table name for a given record type.
     * @param {string} type - The type of record ('lab' or 'course').
     * @return {string} The name of the database table.
     */
    function getTableName(type) {
      return type + 's';
    }

    /**
     * Initializes the Dexie database with tables.
     * @return {Promise<void>}
     */
    async function init() {
      console.debug('initDB - start');
      db.version(2).stores({
        labs: '&id,name,status',
        courses: '&id,name,status',
      });
      console.debug('Using Dexie v' + Dexie.semVer);
    }

    /**
     * Loads the database and caches its tables into memory.
     * Initializes the database if it doesn't exist.
     * @return {Promise<void>}
     */
    async function load() {
      if (!(await Dexie.exists(db.name))) {
        console.debug('Database does not exist. Initializing a new one...');
        await init().catch(Dexie.BulkError, function (e) {
          console.error(e.failures.length + ' items did not succeed.');
        });
      }
      if (!db.isOpen()) {
        await db.open();
        if (Config.isDebugMode) {
          console.log('Database opened: ' + db.name);
          console.log('Database version: ' + db.verno);
        }
      }
      cache.labs = await db.table('labs').toArray();
      cache.courses = await db.table('courses').toArray();
    }

    /**
     * Clears the in-memory cache.
     */
    function clearCache() {
      cache = { labs: null, courses: null };
    }

    /**
     * Retrieves a record from the cache by its ID.
     * @param {string} type - The type of record ('lab' or 'course').
     * @param {number|string} id - The ID of the record to retrieve.
     * @return {Promise<Object>} The record, or an object with a null status if not found.
     */
    async function getRecord(type, id) {
      const tableName = getTableName(type);
      return (
        cache[tableName].find((record) => id == record.id) || { status: null }
      );
    }

    /**
     * Creates a new record in the specified database table.
     * @param {string} type - The type of record ('lab' or 'course').
     * @param {number|string} id - The unique identifier for the record.
     * @param {Object} data - The data to be stored.
     * @return {Promise<number>} The id of the newly created record.
     */
    async function createRecord(type, id, data) {
      data.id = parseInt(id);
      const tableName = getTableName(type);
      const added = await db.table(tableName).add(data);
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
     * @param {number|string} id - The ID of the record to update.
     * @param {Object} data - An object containing the properties to update.
     * @return {Promise<number>} A promise that resolves with the number of updated records (0 or 1).
     */
    async function updateRecord(type, id, data) {
      id = parseInt(id);
      const tableName = getTableName(type);
      const updated = await db.table(tableName).update(id, data);
      if (updated) {
        console.log(
          `Updated a ${type} record:${id} with ${JSON.stringify(
            data
          )} to the database.`
        );
      }
      return updated;
    }

    /**
     * Batch creates new records in the database from an array of records.
     * @param {Array<{type: string, record: Object}>} records - Array of records to be created.
     * @return {Promise<void>}
     */
    async function batchCreate(records) {
      const newRecordsByType = records.reduce((acc, { type, record }) => {
        const tableName = getTableName(type);
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
              const lastKey = await db
                .table(tableName)
                .bulkAdd(newRecordsArray);
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
     * @param {Array<Object>} records - Array of records to be updated.
     * @return {Promise<{labs: number, courses: number}>} An object with counts of updated labs and courses.
     */
    async function batchUpdate(records) {
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

    return {
      load,
      clearCache,
      getRecord,
      createRecord,
      updateRecord,
      batchCreate,
      batchUpdate,
    };
  })();

  /**
   * ----------------------------------------------------------------
   * UI MODULE
   * @namespace UI
   * ----------------------------------------------------------------
   */
  const UI = (function () {
    /**
     * Sets the background color of a DOM element.
     * @param {HTMLElement} element - The DOM element to style.
     * @param {string} colorKey - A key from the Config.colors object.
     * @return {string|null} The hex color code if the key is valid, otherwise null.
     */
    function setBackgroundColor(element, colorKey) {
      if (!(colorKey in Config.colors)) {
        return null;
      }
      const color = Config.colors[colorKey];
      element.style.background = color;
      return color;
    }

    /**
     * Appends a status icon to a DOM element.
     * @param {HTMLElement} element - The DOM element to append the icon to.
     * @param {string} iconKey - A key from the Config.icons object.
     * @param {Object} [options={format_key: 0, elementType: 'p'}] - Options for the icon.
     * @param {number} [options.format_key=0] - The format key for the icon.
     * @param {string} [options.elementType='p'] - The type of element to create for the icon.
     * @param {string} [options.tooltip] - Tooltip text for the icon.
     * @param {string} [options.style] - Inline style for the icon element.
     * @param {string} [options.beforeIcon] - Text to add before the icon.
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
      if (!(iconKey in Config.icons)) {
        return null;
      }
      const icon = Config.icons[iconKey][formatKey];
      const iconElement = document.createElement(elementType);
      iconElement.classList = Config.cssClasses.qcltIcon;
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
     * Shows a snackbar notification at the bottom of the page.
     * @param {Object} options - The options for the snackbar.
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
      snackbar.classList.add(...Config.cssClasses.snackbar);
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
      messageEl.classList.add(...Config.cssClasses.snackbarMessage);
      messageEl.style.margin = '0';
      messageEl.style.flexGrow = '1';

      const actionEl = document.createElement('a');
      actionEl.classList.add(...Config.cssClasses.snackbarClose);
      actionEl.href = '#';
      actionEl.textContent = actionText || '✕';
      if (actionText) {
        messageEl.style.marginRight = '16px';
        Object.assign(actionEl.style, {
          fontWeight: 'bold',
          textTransform: 'uppercase',
          cursor: 'pointer',
          color: '#BB86FC',
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

    return {
      setBackgroundColor,
      appendIcon,
      showSnackbar,
    };
  })();

  /**
   * ----------------------------------------------------------------
   * COMPONENT FACTORY MODULE
   * @namespace ComponentFactory
   * ----------------------------------------------------------------
   */
  const ComponentFactory = (function () {
    /**
     * Creates an HTML element with specified attributes and children.
     * @param {string} tag - The HTML tag for the element.
     * @param {Object} [attributes={}] - An object of attributes to set on the element.
     * @param {Array<Node|string>} [children=[]] - An array of child nodes or strings to append.
     * @return {HTMLElement} The created element.
     */
    function createElement(tag, attributes = {}, children = []) {
      const element = document.createElement(tag);
      for (const [key, value] of Object.entries(attributes)) {
        if (key === 'style') {
          Object.assign(element.style, value);
        } else if (key === 'dataset') {
          Object.assign(element.dataset, value);
        } else {
          element[key] = value;
        }
      }
      for (const child of children) {
        element.append(child);
      }
      return element;
    }

    /**
     * Creates the "Update Database" button.
     * @param {Object} activityData - Data object from trackAndAnnotateActivities.
     * @return {HTMLButtonElement} A button element for triggering the database update.
     */
    function createUpdateButton(activityData) {
      const icon = createElement('i', {
        className: Config.cssClasses.materialIcons,
        textContent: 'sync',
      });
      return createElement(
        'button',
        {
          type: 'button',
          id: 'db-update',
          className: Config.cssClasses.updateButton,
          title: 'Update Database Records',
          disabled: activityData.counts.untrackedRecords === 0,
          dataset: {
            untrackedRecords: JSON.stringify(
              activityData.data.untrackedRecords
            ),
            unregisteredRecords: JSON.stringify(
              activityData.data.unregisteredRecords
            ),
          },
          onclick: PageHandlers.batchUpdateToDb,
        },
        [icon]
      );
    }

    /**
     * Creates a button group container.
     * @return {HTMLDivElement} The button group element.
     */
    function createButtonGroup() {
      return createElement('div', {
        className: Config.cssClasses.buttonGroup,
        style: { marginLeft: 'auto' },
      });
    }

    /**
     * Creates a pagination link, either as a span if disabled or as a link.
     * @param {string} label - The aria-label for the link.
     * @param {string} iconContent - The text content for the material icon.
     * @param {URLSearchParams} newParams - The URL search parameters for the link.
     * @param {boolean} isDisabled - Whether the link should be disabled.
     * @param {string} rel - The rel attribute for the link.
     * @return {HTMLAnchorElement|HTMLSpanElement}
     */
    function createPaginationLink(
      label,
      iconContent,
      newParams,
      isDisabled,
      rel
    ) {
      const createIcon = (label, content) => {
        const icon = createElement('i', {
          className: Config.cssClasses.materialIcons,
          textContent: content,
        });
        icon.setAttribute('aria-label', label);
        return icon;
      };

      if (isDisabled) {
        const span = createElement(
          'span',
          {
            className: `${rel}_page disabled`,
          },
          [createIcon(label, iconContent)]
        );
        span.setAttribute('aria-disabled', 'true');
        return span;
      }

      const newUrl = new URL(window.location.href);
      newUrl.search = newParams.toString();

      return createElement(
        'a',
        {
          className: `${rel}_page`,
          rel: rel,
          href: newUrl.toString(),
        },
        [createIcon(label, iconContent)]
      );
    }

    /**
     * Creates the per-page dropdown menu for pagination.
     * @param {number} currentPerPage - The currently selected number of items per page.
     * @param {URLSearchParams} params - The current URL search parameters.
     * @return {HTMLSelectElement}
     */
    function createPerPageDropdown(currentPerPage, params) {
      const perPageOptions = Config.pagination.perPageOptions;
      const defaultPerPage = Config.pagination.defaultPerPage;

      return createElement(
        'select',
        {
          className: 'per-page-dropdown',
          style: {
            fontSize: '14px',
            marginLeft: '10px',
            borderRadius: '8px',
            height: 'auto',
          },
          onchange: (event) => {
            const newPerPage = parseInt(event.target.value);
            const newParams = new URLSearchParams(params);
            newParams.set('page', 1); // Reset to first page
            if (newPerPage !== defaultPerPage) {
              newParams.set('per_page', newPerPage);
            } else {
              newParams.delete('per_page');
            }
            window.location.search = newParams.toString();
          },
        },
        perPageOptions.map((optionValue) =>
          createElement('option', {
            value: optionValue,
            textContent: `${optionValue} per page`,
            selected: optionValue === currentPerPage,
          })
        )
      );
    }

    /**
     * Creates pagination controls for the activities page.
     * @param {number} onPage - The number of items currently displayed on the page.
     * @return {HTMLDivElement} The pagination container element.
     */
    function createActivitesPagination(onPage) {
      const defaultPerPage = Config.pagination.defaultPerPage;
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      const perPage =
        parseInt(params.get('per_page')) || Config.pagination.defaultPerPage;
      const currentPage = parseInt(params.get('page')) || 1;

      const pagination = createElement('div', {
        className: 'pagination__navigation',
      });

      const prevParams = new URLSearchParams(params);
      prevParams.set('page', currentPage - 1);
      if (perPage !== defaultPerPage) {
        prevParams.set('per_page', perPage);
      }
      const prevLink = createPaginationLink(
        'Previous page',
        'navigate_before',
        prevParams,
        currentPage === 1,
        'previous'
      );
      pagination.appendChild(prevLink);

      const nextParams = new URLSearchParams(params);
      nextParams.set('page', currentPage + 1);
      if (perPage !== defaultPerPage) {
        nextParams.set('per_page', perPage);
      }
      const nextLink = createPaginationLink(
        'Next page',
        'navigate_next',
        nextParams,
        perPage > onPage,
        'next'
      );
      pagination.appendChild(nextLink);

      const perPageDropdown = createPerPageDropdown(perPage, params);
      pagination.appendChild(perPageDropdown);

      return pagination;
    }

    /**
     * Creates and appends a search link to an element.
     * @param {HTMLElement} element - The DOM element to append the link to.
     * @param {string} searchTerm - The search query.
     * @return {HTMLAnchorElement} The created anchor element.
     */
    function appendSeachLink(element, searchTerm) {
      const aTag = createElement('a', {
        href: `${
          Config.urls.cloudSkillsBoost
        }/catalog?keywords=${encodeURIComponent(searchTerm)}`,
        style: { paddingLeft: '0.25em' },
      });
      element.appendChild(aTag);
      return aTag;
    }

    return {
      createUpdateButton,
      createButtonGroup,
      createActivitesPagination,
      appendSeachLink,
    };
  })();

  /**
   * ----------------------------------------------------------------
   * PAGE HANDLERS
   * @namespace PageHandlers
   * ----------------------------------------------------------------
   */
  const PageHandlers = (function () {
    // --- Private Helper Functions ---

    /**
     * Standardizes a title string by correcting spacing and removing extra spaces.
     * @param {string} title - The lab or course title.
     * @return {string} The formatted title.
     */
    function formatTitle(title) {
      return title.replace(/:\S/g, ': ').replace(/\s\s+/g, ' ').trim();
    }

    /**
     * Parses a raw activity record from the page to extract structured data.
     * @param {Object} record - The raw record object from the page.
     * @return {{id: (string|null), name: string, type: string, passed: boolean}}
     */
    function parseActivityRecord(record) {
      const tempContainer = document.createElement('div');

      tempContainer.innerHTML = record.type;
      const typeLabel = tempContainer.querySelector('ql-activity-label');
      const type = typeLabel
        ? typeLabel.getAttribute('activity').toLowerCase()
        : 'unknown';

      tempContainer.innerHTML = record.name;
      const link = tempContainer.querySelector('a');
      const name = link ? link.textContent.trim() : record.name;
      const id = link
        ? link.href.match(/\/\w+\/(?<id>\d+)/)?.groups?.id || null
        : null;

      return { id, name, type, passed: record.passed };
    }

    /**
     * Annotates a single row in the activities table.
     * @param {HTMLElement} rowElement - The table row element to annotate.
     * @param {Object} rawRecord - The raw activity record corresponding to the row.
     * @param {{untrackedRecords: Object[], unregisteredRecords: Object[]}} staging - Staging object for batch
     *     operations.
     * @return {Promise<void>}
     */
    async function annotateActivityRow(rowElement, rawRecord, staging) {
      const { id, name, type, passed } = parseActivityRecord(rawRecord);

      if (type !== 'lab' && type !== 'course') {
        return; // Skip if no ID or not a trackable type
      }

      const dbRecord = await Database.getRecord(type, id);

      const isPassed = passed || type === 'course' && passed === null;

      if (isPassed) {
        switch (dbRecord.status) {
          case 'finished':
            UI.setBackgroundColor(rowElement, 'green');
            rowElement.classList.add(`completed-${type}`);
            break;
          case '': // Untracked but finished
            UI.setBackgroundColor(rowElement, 'yellow');
            rowElement.classList.add(`untracked-${type}`);
            staging.untrackedRecords.push({ type, ...dbRecord });
            break;
          case null: // New record
            UI.setBackgroundColor(rowElement, 'yellow');
            rowElement.classList.add(`new-${type}`);
            const newRecord = {
              id: parseInt(id),
              name: formatTitle(name),
              status: '',
            };
            staging.unregisteredRecords.push({ type, record: newRecord });
            const col1 = rowElement.children[0];
            UI.appendIcon(col1, 'warning', {
              format_key: 1,
              elementType: 'span',
              beforeIcon: ' ',
              tooltip: 'Unregistered activity',
            });
            if (!col1.querySelector('a')) {
              const searchIcon = ComponentFactory.appendSeachLink(
                col1,
                col1.innerText
              );
              UI.appendIcon(searchIcon, 'search', {
                format_key: 1,
                elementType: 'span',
                tooltip: 'Search this activity',
              });
            }
            break;
        }
      } else {
        UI.setBackgroundColor(rowElement, 'red');
      }
    }

    /**
     * Tracks and annotates each row in the activities table based on database records.
     * @param {Object[]} records - An array of activity data from the page.
     * @return {Promise<{counts: {rows: number, untrackedRecords: number, unregisteredRecords: number},
     *    data: {untrackedRecords: Object[], unregisteredRecords: Object[]}}>}
     */
    async function trackAndAnnotateActivities(records) {
      const staging = { untrackedRecords: [], unregisteredRecords: [] };
      const activityTable = document.querySelector(
        Config.selectors.activityTable
      );

      if (!activityTable || !records) {
        return {
          counts: { rows: 0, untrackedRecords: 0, unregisteredRecords: 0 },
          data: {},
        };
      }

      const rows = activityTable.shadowRoot.querySelectorAll('tbody > tr');
      for (const [i, row] of rows.entries()) {
        await annotateActivityRow(row, records[i], staging);
      }

      if (staging.unregisteredRecords.length > 0) {
        await Database.batchCreate(staging.unregisteredRecords);
      }

      if (Config.isDebugMode) {
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

    /**
     * Annotates a list of titles (e.g., in a catalog) based on their completion status.
     * @param {NodeListOf<HTMLElement>} titles - A list of DOM elements containing titles.
     * @return {Promise<void>}
     */
    async function trackListOfTitles(titles) {
      for (const title of titles) {
        const matches = title.innerHTML.match(/data-type="(.+)" \D+(\d+)/);
        if (!matches) continue;

        const [, type, id] = matches;
        const record = await Database.getRecord(type.toLowerCase(), id);

        console.log(
          `${type} ID: ${id}, Title: "${title.innerText}", Record: ${JSON.stringify(record)}`
        );

        switch (record.status) {
          case 'finished':
            UI.setBackgroundColor(title, 'green');
            UI.appendIcon(title, 'check', { beforeIcon: ' ' });
            break;
          case null:
            UI.setBackgroundColor(title, 'yellow');
            UI.appendIcon(title, 'new', { beforeIcon: ' ' });
            break;
        }
      }
    }

    /**
     * Scans through activity cards on the page and annotates them based on completion status.
     * @param {NodeListOf<HTMLElement>} cards - A list of ql-activity-card elements.
     * @return {Promise<void>}
     */
    async function trackActivityCards(cards) {
      for (const card of cards) {
        if (!card.shadowRoot) {
          console.warn('No shadowRoot found for card:', card);
          continue;
        }

        let id;
        let name;
        let type;
        if (card.hasAttribute('path')) {
          id = card.getAttribute('path').match(/\/(\d+)/)[1];
          name = card.getAttribute('title');
          type = card.getAttribute('type').toLowerCase();
        } else {
          const link = card.shadowRoot.firstElementChild;
          const label = card.shadowRoot.querySelector('ql-activity-label');
          if (!link || !label) continue;
          id = link.getAttribute('href').match(/\/(\d+)/)[1];
          name = link.getAttribute('title');
          type = label.getAttribute('activity').toLowerCase();
        }

        if (!id || !type || type !== 'lab' && type !== 'course') continue;

        const cardTitle = card.shadowRoot.querySelector('h3');
        const record = await Database.getRecord(type, id);

        console.log(
          `${type} ID: ${id}, Title: "${name}", Record: ${JSON.stringify(record)}`
        );

        const options = {
          format_key: 1,
          elementType: 'span',
          style: 'margin-left: 4px',
        };
        if (record.status === 'finished') {
          UI.appendIcon(cardTitle, 'check', options);
        } else if (record.status === null) {
          UI.appendIcon(cardTitle, 'new', options);
        }
      }
    }

    /**
     * Annotates the title on a detail page (lab or course) based on its completion status.
     * @param {string} type - The type of detail page ('lab' or 'course').
     * @param {string} id - The ID of the lab or course.
     * @return {Promise<void>}
     */
    async function trackTitleOnDetailPage(type, id) {
      const isLab = type === 'lab';
      const selector = isLab
        ? Config.selectors.labPageTitle
        : Config.selectors.coursePageTitle;
      const pageTitleEl = document.querySelector(selector);
      if (!pageTitleEl) return console.warn(`Element '${selector}' not found.`);

      const h1 = pageTitleEl.querySelector(Config.selectors.h1);
      if (!h1) return console.warn(`h1 not found in '${selector}'.`);

      const title = h1.innerText;
      const record = await Database.getRecord(type, id);
      const options = {
        format_key: 1,
        elementType: 'span',
        style: isLab ? 'display: inline-block; vertical-align:super;' : '',
      };

      console.log(
        `${type} ID: ${id}, Title: "${title}", Record: ${JSON.stringify(record)}`
      );

      switch (record.status) {
        case 'finished':
          UI.setBackgroundColor(h1, isLab ? 'green' : 'darkGreen');
          UI.appendIcon(isLab ? h1 : pageTitleEl, 'check', options);
          Database.updateRecord(type, id, { name: formatTitle(title) });
          break;
        case null:
          UI.setBackgroundColor(h1, isLab ? 'yellow' : 'darkOrange');
          UI.appendIcon(isLab ? h1 : pageTitleEl, 'new', options);
          Database.createRecord(type, id, {
            name: formatTitle(title),
            status: '',
          });
          break;
      }
    }

    // --- Public Functions ---

    /**
     * Handler for the home page.
     * @return {Promise<void>}
     */
    async function home() {
      console.debug('Tracking card data on Home');
      const cards = document.querySelectorAll(Config.selectors.activityCard);
      await trackActivityCards(cards);
    }

    /**
     * Handler for the catalog page.
     * @return {Promise<void>}
     */
    async function catalog() {
      console.debug('Tracking data on Catalog');
      const container = document.querySelector(
        Config.selectors.searchResultContainer
      );
      if (container && container.shadowRoot) {
        const cards = container.shadowRoot.querySelectorAll(
          Config.selectors.activityCard
        );
        await trackActivityCards(cards);
      } else {
        console.warn(
          `Element '${Config.selectors.searchResultContainer}' not found or has no shadowRoot.`
        );
      }
    }

    /**
     * Handler for the lab detail page.
     * @param {string} id - The ID of the lab.
     * @return {Promise<void>}
     */
    async function lab(id) {
      console.debug('Tracking a lab page');
      await trackTitleOnDetailPage('lab', id);
    }

    /**
     * Handler for the course detail page.
     * @param {string} id - The ID of the course.
     * @return {Promise<void>}
     */
    async function course(id) {
      console.debug('Tracking a course page');
      await trackTitleOnDetailPage('course', id);
      const titles = document.querySelectorAll('.catalog-item__title');
      await trackListOfTitles(titles);
    }

    /**
     * Handler for the user profile activity page.
     * @return {Promise<void>}
     */
    async function activity() {
      console.debug('Tracking activity data on Profile');
      const activitiesData =
        document.querySelector(Config.selectors.activityTable)?.data || null;
      const results = await trackAndAnnotateActivities(activitiesData);

      const updateButton = ComponentFactory.createUpdateButton(results);
      updateButton.style.cssText = 'margin: auto 0 auto auto';
      const pagination = ComponentFactory.createActivitesPagination(
        results.counts.rows
      );
      pagination.style.cssText = 'margin: auto 12px auto 36px';

      const buttonGroup = ComponentFactory.createButtonGroup();
      buttonGroup.appendChild(updateButton);
      buttonGroup.appendChild(pagination);

      const activityFilters = document.querySelector(
        '#learning_activity_search .filters'
      );
      if (activityFilters) {
        activityFilters.appendChild(buttonGroup);
      } else {
        console.warn("Element '#learning_activity_search .filters' not found.");
      }
    }

    /**
     * Batch updates the status of untracked activity records to 'finished' in the database.
     * @return {Promise<void>}
     */
    async function batchUpdateToDb() {
      const updateButton = document.querySelector(
        `button${Config.selectors.updateButton}`
      );
      if (!updateButton) return console.error('Update button not found.');

      const untrackedRecordsJSON = updateButton.dataset.untrackedRecords;
      const recordsToUpdate = untrackedRecordsJSON
        ? JSON.parse(untrackedRecordsJSON)
        : [];

      if (recordsToUpdate.length === 0) {
        return UI.showSnackbar({ message: '0 items to update' });
      }

      const counts = await Database.batchUpdate(recordsToUpdate);
      const totalUpdates = counts.labs + counts.courses;

      if (totalUpdates === 0) {
        UI.showSnackbar({ message: '0 items to update' });
      } else {
        const coursesStr = counts.courses > 0 ? `${counts.courses} course` : '';
        const labsStr = counts.labs > 0 ? `${counts.labs} lab` : '';
        const andStr = coursesStr && labsStr ? ' and ' : '';
        const plural = totalUpdates > 1 ? 's' : '';
        const message = `Updated ${coursesStr}${andStr}${labsStr} record${plural}`;

        UI.showSnackbar({
          message: message,
          actionText: 'Refresh',
          onAction: () => location.reload(),
        });
      }
      console.log('Batch updated - finished');
    }

    return {
      home,
      catalog,
      lab,
      course,
      activity,
      batchUpdateToDb,
    };
  })();

  /**
   * @typedef {object} Route
   * @property {RegExp} path - The URL path pattern to match.
   * @property {Function} handler - The handler function for the route.
   */

  /**
   * ----------------------------------------------------------------
   * ROUTER
   * @namespace Router
   * ----------------------------------------------------------------
   */
  const Router = (function () {
    /**
     * An array of route objects, each defining a URL pattern and a handler.
     * @type {Route[]}
     */
    const routes = [
      { path: /^\/$/, handler: PageHandlers.home },
      { path: /^\/catalog/, handler: PageHandlers.catalog },
      { path: /^\/focuses\/(?<id>\d+)/, handler: PageHandlers.lab },
      { path: /^\/course_templates\/(?<id>\d+)/, handler: PageHandlers.course },
      { path: /^\/profile\/activity/, handler: PageHandlers.activity },
    ];

    /**
     * Matches the current URL against the defined routes and executes the corresponding handler.
     * @return {Promise<void>}
     */
    async function handle() {
      const currentPath = window.location.pathname;
      for (const route of routes) {
        const match = currentPath.match(route.path);
        if (match) {
          const id = match.groups?.id;
          if (id) {
            await route.handler(id);
          } else {
            await route.handler();
          }
          return;
        }
      }
    }

    return {
      handle,
    };
  })();

  /**
   * ----------------------------------------------------------------
   * MAIN EXECUTION
   * ----------------------------------------------------------------
   */
  /**
   * Main function for the userscript.
   * @return {Promise<void>}
   */
  async function main() {
    await Database.load();
    await Router.handle();
    Database.clearCache();
    console.debug('Tracking - end');
  }

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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../qwiklabs-explorer.user.js';

// Mock the modules that PageHandlers depends on
const { PageHandlers, Database, UI, ComponentFactory } =
  window.qwiklabs_testing;

// This is a complex mocking strategy required because the script is not modular.
// We spy on the methods of the modules attached to the window object.
vi.spyOn(Database, 'getRecord').mockResolvedValue({ status: null });
vi.spyOn(Database, 'batchCreate').mockResolvedValue(undefined);
vi.spyOn(Database, 'batchUpdate').mockResolvedValue({ labs: 0, courses: 0 });
vi.spyOn(UI, 'setBackgroundColor').mockReturnValue('');
vi.spyOn(UI, 'appendIcon').mockReturnValue('');
vi.spyOn(UI, 'showSnackbar').mockImplementation(() => {});
vi.spyOn(ComponentFactory, 'createUpdateButton').mockImplementation((...args) => {
    const button = document.createElement('button');
    // Pass through dataset for batchUpdateToDb test
    if (args[0] && args[0].data && args[0].data.untrackedRecords) {
        button.dataset.untrackedRecords = JSON.stringify(args[0].data.untrackedRecords);
    }
    return button;
});
vi.spyOn(ComponentFactory, 'createActivitesPagination').mockReturnValue(document.createElement('div'));
vi.spyOn(ComponentFactory, 'createButtonGroup').mockImplementation((...children) => {
    const div = document.createElement('div');
    for(const child of children) {
        if(child) div.appendChild(child);
    }
    return div;
});


describe('PageHandlers Module', () => {

  beforeEach(() => {
    // Reset mocks and DOM before each test
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('activity handler', () => {
    /**
     * Sets up the DOM with a mock activity page for testing.
     * @param {Array<object>} records - An array of activity records to populate the page with.
     * @return {HTMLElement} The created table element.
     */
    function setupActivityPage(records) {
            document.body.innerHTML = '<div id="learning_activity_search"><div class="filters"></div></div>';

      const table = document.createElement('div');
      table.className = 'activities-table'; // Use the class selector the handler looks for
      table.attachShadow({ mode: 'open' });

      const tableBody = document.createElement('tbody');
      table.shadowRoot.appendChild(tableBody);

      let tableRowsHTML = '';
      for (const record of records) {
        tableRowsHTML += `<tr><td>${record.name}</td></tr>`;
      }
      tableBody.innerHTML = tableRowsHTML;

      table.data = records;
      document.body.appendChild(table);
      return table;
    }

    it('should annotate a completed, untracked lab', async () => {
            const records = [{
          name: '<a href="/focuses/1">Lab 1</a>',
          type: '<ql-activity-label activity="Lab"></ql-activity-label>',
                passed: true
            }];
      const table = setupActivityPage(records);
            Database.getRecord.mockResolvedValue({ id: 1, name: 'Lab 1', status: '' });

      await PageHandlers.activity();

      const row = table.shadowRoot.querySelector('tr');
      expect(UI.setBackgroundColor).toHaveBeenCalledWith(row, 'yellow');
      expect(row.classList.contains('untracked-lab')).toBe(true);
    });

    it('should annotate a new, completed course', async () => {
            const records = [{
          name: '<a href="/course_templates/101">Course 1</a>',
          type: '<ql-activity-label activity="Course"></ql-activity-label>',
                passed: true
            }];
      const table = setupActivityPage(records);
      Database.getRecord.mockResolvedValue({ status: null });

      await PageHandlers.activity();

      const row = table.shadowRoot.querySelector('tr');
      expect(UI.setBackgroundColor).toHaveBeenCalledWith(row, 'yellow');
      expect(row.classList.contains('new-course')).toBe(true);
      expect(Database.batchCreate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'course',
                        record: expect.objectContaining({ id: 101, name: 'Course 1' })
                    })
        ])
      );
    });

    it('should annotate a previously finished lab', async () => {
            const records = [{ name: '<a href="/focuses/2">Lab 2</a>', type: '<ql-activity-label activity="Lab"></ql-activity-label>', passed: true }];
      const table = setupActivityPage(records);
            Database.getRecord.mockResolvedValue({ id: 2, name: 'Lab 2', status: 'finished' });

      await PageHandlers.activity();

      const row = table.shadowRoot.querySelector('tr');
      expect(UI.setBackgroundColor).toHaveBeenCalledWith(row, 'green');
      expect(row.classList.contains('completed-lab')).toBe(true);
    });
  });

  describe('batchUpdateToDb handler', () => {
    it('should do nothing and show a "0 items" snackbar if no records are in the dataset', async () => {
      const button = document.createElement('button');
      button.id = 'db-update';
      button.dataset.untrackedRecords = '[]';
      document.body.appendChild(button);

      await PageHandlers.batchUpdateToDb();

      expect(Database.batchUpdate).not.toHaveBeenCalled();
            expect(UI.showSnackbar).toHaveBeenCalledWith({ message: '0 items to update' });
    });

    it('should call batchUpdate and show a success snackbar with correct counts', async () => {
      const records = [
        { id: 1, type: 'lab' },
                { id: 101, type: 'course' }
      ];
      const button = document.createElement('button');
      button.id = 'db-update';
      button.dataset.untrackedRecords = JSON.stringify(records);
      document.body.appendChild(button);

      Database.batchUpdate.mockResolvedValue({ labs: 1, courses: 1 });

      await PageHandlers.batchUpdateToDb();

      expect(Database.batchUpdate).toHaveBeenCalledWith(records);
      expect(UI.showSnackbar).toHaveBeenCalledWith({
        message: 'Updated 1 course and 1 lab records',
        actionText: 'Refresh',
                onAction: expect.any(Function)
      });
    });
  });
});

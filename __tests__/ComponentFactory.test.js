import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../qwiklabs-explorer.user.js';

const { ComponentFactory, Config, PageHandlers } = window.qwiklabs_testing;

describe('ComponentFactory Module', () => {
  let testElement;

  beforeEach(() => {
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
    // Mock the PageHandlers.batchUpdateToDb as the factory assigns it directly
    PageHandlers.batchUpdateToDb = vi.fn();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('createUpdateButton', () => {
    it('should create a disabled button when there are no untracked records', () => {
      const activityData = {
        counts: { untrackedRecords: 0 },
        data: { untrackedRecords: [], unregisteredRecords: [] },
      };
      const button = ComponentFactory.createUpdateButton(activityData);
      expect(button.tagName).toBe('BUTTON');
      expect(button.id).toBe('db-update');
      expect(button.disabled).toBe(true);
      expect(button.dataset.untrackedRecords).toBe('[]');
    });

    it('should create an enabled button when there are untracked records', () => {
      const activityData = {
        counts: { untrackedRecords: 1 },
        data: { untrackedRecords: [{ id: 1 }], unregisteredRecords: [] },
      };
      const button = ComponentFactory.createUpdateButton(activityData);
      expect(button.disabled).toBe(false);
      expect(button.dataset.untrackedRecords).toBe('[{"id":1}]');
    });

    it('should assign the batchUpdateToDb handler to onclick', () => {
      const activityData = {
        counts: { untrackedRecords: 1 },
        data: { untrackedRecords: [{ id: 1 }], unregisteredRecords: [] },
      };
      const button = ComponentFactory.createUpdateButton(activityData);
      button.click();
      expect(PageHandlers.batchUpdateToDb).toHaveBeenCalledTimes(1);
    });
  });

  describe('createButtonGroup', () => {
    it('should create a div with the correct button group class', () => {
      const group = ComponentFactory.createButtonGroup();
      expect(group.tagName).toBe('DIV');
      expect(group.className).toBe(Config.cssClasses.buttonGroup);
    });
  });

  describe('appendSearchLink', () => {
    it('should append a correctly formatted search link to an element', () => {
      const searchTerm = 'Test Lab';
      const link = ComponentFactory.appendSearchLink(testElement, searchTerm);

      expect(link.tagName).toBe('A');
      expect(link.href).toBe(
        `${Config.urls.cloudSkillsBoost}/catalog?keywords=Test%20Lab`
      );
      expect(testElement.contains(link)).toBe(true);
    });
  });

  describe('createActivitesPagination', () => {
    const originalLocation = window.location;

    // Helper to mock window.location
    const mockLocation = (search) => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: new URL(`https://example.com/profile/activity${search}`),
      });
    };

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: originalLocation,
      });
    });

    it('should create pagination with "previous" disabled on page 1', () => {
      mockLocation('?page=1');
      const pagination = ComponentFactory.createActivitesPagination(25);
      const prevLink = pagination.querySelector('.previous_page');
      expect(prevLink.tagName).toBe('SPAN');
      expect(prevLink.classList.contains('disabled')).toBe(true);
    });

    it('should create pagination with "next" disabled if onPage is less than perPage', () => {
      mockLocation('?page=2&per_page=50');
      // We have 49 items on a page that fits 50, so this is the last page.
      const pagination = ComponentFactory.createActivitesPagination(49);
      const nextLink = pagination.querySelector('.next_page');
      expect(nextLink.tagName).toBe('SPAN');
      expect(nextLink.classList.contains('disabled')).toBe(true);
    });

    it('should create enabled "previous" and "next" links when appropriate', () => {
      mockLocation('?page=2&per_page=25');
      const pagination = ComponentFactory.createActivitesPagination(25);
      const prevLink = pagination.querySelector('.previous_page');
      const nextLink = pagination.querySelector('.next_page');

      expect(prevLink.tagName).toBe('A');
      expect(prevLink.classList.contains('disabled')).toBe(false);
      expect(prevLink.href).toContain('page=1');

      expect(nextLink.tagName).toBe('A');
      expect(nextLink.classList.contains('disabled')).toBe(false);
      expect(nextLink.href).toContain('page=3');
    });

    it('should create a per-page dropdown with the correct value selected', () => {
      mockLocation('?per_page=50');
      const pagination = ComponentFactory.createActivitesPagination(50);
      const dropdown = pagination.querySelector('.per-page-dropdown');

      expect(dropdown.tagName).toBe('SELECT');
      expect(dropdown.value).toBe('50');
      expect(dropdown.options.length).toBe(
        Config.pagination.perPageOptions.length
      );
    });
  });
});

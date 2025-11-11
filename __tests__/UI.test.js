import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../qwiklabs-explorer.user.js';

const { UI, Config } = window.qwiklabs_testing;

describe('UI Module', () => {
  let testElement;

  // Create a fresh div for each test
  beforeEach(() => {
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
  });

  // Clean up the DOM after each test
  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('setBackgroundColor', () => {
    it('should set the background color for a valid color key', () => {
      const color = UI.setBackgroundColor(testElement, 'green');
      expect(testElement.style.background).toBe('rgb(238, 255, 238)'); // JSDOM renders #efe as this
      expect(color).toBe(Config.colors.green);
    });

    it('should not set the background color for an invalid key and should return null', () => {
      const color = UI.setBackgroundColor(testElement, 'nonexistentColor');
      expect(testElement.style.background).toBe('');
      expect(color).toBeNull();
    });
  });

  describe('appendIcon', () => {
    it('should append a valid icon with default options', () => {
      UI.appendIcon(testElement, 'check');
      const iconElement = testElement.querySelector('.qclt-icon');

      expect(iconElement).not.toBeNull();
      expect(iconElement.tagName).toBe('P'); // Default elementType is 'p'
      expect(iconElement.innerHTML).toBe(Config.icons.check[0]);
    });

    it('should return null and not append anything for an invalid icon key', () => {
      const iconHTML = UI.appendIcon(testElement, 'nonexistentIcon');
      const iconElement = testElement.querySelector('.qclt-icon');

      expect(iconElement).toBeNull();
      expect(iconHTML).toBeNull();
    });

    it('should apply all provided options correctly', () => {
      const options = {
        format_key: 1,
        elementType: 'span',
        tooltip: 'This is a test tooltip',
        style: 'font-size: 16px;',
        beforeIcon: 'Status: ',
      };

      UI.appendIcon(testElement, 'warning', options);
      const iconElement = testElement.querySelector('.qclt-icon');

      expect(iconElement).not.toBeNull();
      expect(iconElement.tagName).toBe('SPAN');
      expect(iconElement.getAttribute('title')).toBe(options.tooltip);
      expect(iconElement.getAttribute('style')).toBe(options.style);
      expect(iconElement.innerText).toBe(options.beforeIcon);
      expect(iconElement.innerHTML).toContain(Config.icons.warning[1]);
    });
  });

  describe('showSnackbar', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should create and show a snackbar with a message', () => {
      UI.showSnackbar({ message: 'Test message' });
      const snackbar = document.getElementById('snackbar');
      const messageEl = snackbar.querySelector('.js-alert-message');

      expect(snackbar).not.toBeNull();
      expect(messageEl.textContent).toBe('Test message');
    });

    it('should auto-dismiss the snackbar after the default delay', () => {
      UI.showSnackbar({ message: 'Auto-dismiss test' });
      let snackbar = document.getElementById('snackbar');
      expect(snackbar).not.toBeNull();

      // Advance time by the default delay
      vi.advanceTimersByTime(10000);

      snackbar = document.getElementById('snackbar');
      expect(snackbar).toBeNull();
    });

    it('should show an action button and call onAction when clicked', () => {
      const onActionMock = vi.fn();
      UI.showSnackbar({
        message: 'Action test',
        actionText: 'Click Me',
        onAction: onActionMock,
      });

      const actionButton = document.querySelector('.js-alert-close');
      expect(actionButton).not.toBeNull();
      expect(actionButton.textContent).toBe('Click Me');

      // Simulate a click
      actionButton.click();

      expect(onActionMock).toHaveBeenCalledTimes(1);
    });

    it('should call onAction when auto-dismissing if provided', () => {
      const onActionMock = vi.fn();
      UI.showSnackbar({
        message: 'Action test',
        actionText: 'Click Me',
        onAction: onActionMock,
      });

      // Advance time to trigger auto-dismiss
      vi.advanceTimersByTime(10000);

      expect(onActionMock).toHaveBeenCalledTimes(1);
    });

    it('should remove the snackbar when the default close button is clicked', () => {
      UI.showSnackbar({ message: 'Close test' });
      let snackbar = document.getElementById('snackbar');
      const closeButton = snackbar.querySelector('.js-alert-close');
      expect(closeButton.textContent).toBe('✕');

      closeButton.click();

      snackbar = document.getElementById('snackbar');
      expect(snackbar).toBeNull();
    });
  });
});

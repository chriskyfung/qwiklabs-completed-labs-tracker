import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import '../qwiklabs-explorer.user.js';

const { Router } = window.qwiklabs_testing;

describe('Router Module', () => {
  const originalLocation = window.location;
  let mockPageHandlers;

  const mockLocation = (pathname) => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, pathname },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = ''; // No complex DOM needed as handlers are fully mocked

    // Create mock PageHandlers for injection
    mockPageHandlers = {
      home: vi.fn(() => Promise.resolve()),
      catalog: vi.fn(() => Promise.resolve()),
      lab: vi.fn(() => Promise.resolve()),
      course: vi.fn(() => Promise.resolve()),
      activity: vi.fn(() => Promise.resolve()),
    };
  });

  afterEach(() => {
    // Restore window.location
    Object.defineProperty(window, 'location', {
        writable: true,
        value: originalLocation,
    });
  });

  it('should call the home handler for the root path', async () => {
    mockLocation('/');
    await Router.handle(mockPageHandlers);
    expect(mockPageHandlers.home).toHaveBeenCalledTimes(1);
  });

  it('should call the catalog handler for the catalog path', async () => {
    mockLocation('/catalog');
    await Router.handle(mockPageHandlers);
    expect(mockPageHandlers.catalog).toHaveBeenCalledTimes(1);
  });

  it('should call the lab handler for a lab path with an ID', async () => {
    mockLocation('/focuses/12345');
    await Router.handle(mockPageHandlers);
    expect(mockPageHandlers.lab).toHaveBeenCalledTimes(1);
    expect(mockPageHandlers.lab).toHaveBeenCalledWith('12345');
  });

  it('should call the course handler for a course path with an ID', async () => {
    mockLocation('/course_templates/67890');
    await Router.handle(mockPageHandlers);
    expect(mockPageHandlers.course).toHaveBeenCalledTimes(1);
    expect(mockPageHandlers.course).toHaveBeenCalledWith('67890');
  });

  it('should call the activity handler for the activity path', async () => {
    mockLocation('/profile/activity');
    await Router.handle(mockPageHandlers);
    expect(mockPageHandlers.activity).toHaveBeenCalledTimes(1);
  });

  it('should not call any handler for an unknown path', async () => {
    mockLocation('/some/other/path');
    await Router.handle(mockPageHandlers);
    expect(mockPageHandlers.home).not.toHaveBeenCalled();
    expect(mockPageHandlers.catalog).not.toHaveBeenCalled();
    expect(mockPageHandlers.lab).not.toHaveBeenCalled();
    expect(mockPageHandlers.course).not.toHaveBeenCalled();
    expect(mockPageHandlers.activity).not.toHaveBeenCalled();
  });
});

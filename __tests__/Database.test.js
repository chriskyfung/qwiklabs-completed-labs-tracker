import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../qwiklabs-explorer.user.js';

// Since the script is not a module, it attaches its testable parts to the window.
const { Database, Config } = window.qwiklabs_testing;

// We need a direct instance of the DB to clear it between tests
const db = new global.Dexie(Config.dbName);
db.version(2).stores({
  labs: '&id,name,status',
  courses: '&id,name,status',
});

describe('Database Module', () => {
  // Before each test, clear the database tables and the in-memory cache
  beforeEach(async () => {
    await db.labs.clear();
    await db.courses.clear();
    Database.clearCache();
  });

  afterEach(() => {
    // Ensure cache is cleared after each test
    Database.clearCache();
  });

  it('should load the database and cache the tables', async () => {
    expect(Database.isCacheLoaded()).toBe(false);
    await Database.load();
    expect(Database.isCacheLoaded()).toBe(true);
  });

  it('should create a new lab record', async () => {
    const labId = 123;
    const labData = { name: 'Test Lab', status: '' };

    await Database.createRecord('lab', labId, labData);

    // Verify directly from the database
    const recordInDb = await db.labs.get(labId);
    expect(recordInDb).toBeDefined();
    expect(recordInDb.name).toBe('Test Lab');

    // Verify through the module's getRecord function (which uses cache)
    Database.clearCache(); // Clear cache to force a reload from DB
    const recordFromFunc = await Database.getRecord('lab', labId);
    expect(recordFromFunc.id).toBe(labId);
    expect(recordFromFunc.name).toBe('Test Lab');
  });

  it('should return an object with null status for a non-existent record', async () => {
    const record = await Database.getRecord('lab', 999);
    expect(record).toBeDefined();
    expect(record.status).toBeNull();
  });

  it('should update an existing record', async () => {
    const labId = 456;
    await Database.createRecord('lab', labId, { name: 'Old Name', status: '' });

    await Database.updateRecord('lab', labId, { status: 'finished' });

    const updatedRecord = await db.labs.get(labId);
    expect(updatedRecord.status).toBe('finished');
  });

  it('should batch update records', async () => {
    const recordsToUpdate = [
      { id: 1, type: 'lab', name: 'Lab 1', status: '' },
      { id: 2, type: 'lab', name: 'Lab 2', status: '' },
      { id: 101, type: 'course', name: 'Course 1', status: '' },
    ];

    // First, add them to the DB
    await db.labs.bulkAdd([
      { id: 1, name: 'Lab 1', status: '' },
      { id: 2, name: 'Lab 2', status: '' },
    ]);
    await db.courses.bulkAdd([{ id: 101, name: 'Course 1', status: '' }]);

    const counts = await Database.batchUpdate(recordsToUpdate);

    expect(counts.labs).toBe(2);
    expect(counts.courses).toBe(1);

    const lab1 = await db.labs.get(1);
    const course1 = await db.courses.get(101);

    expect(lab1.status).toBe('finished');
    expect(course1.status).toBe('finished');
  });
});

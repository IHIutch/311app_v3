CREATE TABLE users (
  id TEXT PRIMARY KEY,
  publicId TEXT NOT NULL UNIQUE,
  firstName TEXT,
  lastName TEXT,
  type TEXT NOT NULL DEFAULT 'USER' CHECK (type IN ('USER', 'ADMIN')),
  clerkId TEXT UNIQUE,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deletedAt TEXT
);

CREATE TABLE reportTypes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  "group" TEXT NOT NULL,
  markerColor TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deletedAt TEXT
);

CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  streetNumber INTEGER,
  streetName TEXT,
  postalCode TEXT,
  neighborhood TEXT,
  -- Historical coordinates are stored as supplied. New submissions validate bounds.
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'CREATED'
    CHECK (status IN ('OPEN', 'CREATED', 'IN_REVIEW', 'ASSIGNED', 'SCHEDULED', 'CLOSED')),
  details TEXT,
  reportTypeId INTEGER NOT NULL REFERENCES reportTypes(id),
  creatorId TEXT REFERENCES users(id),
  submissionKey TEXT UNIQUE,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deletedAt TEXT
);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  objectType TEXT NOT NULL DEFAULT 'REPORT' CHECK (objectType = 'REPORT'),
  objectId INTEGER NOT NULL REFERENCES reports(id),
  content TEXT NOT NULL,
  replyTo INTEGER,
  creatorId TEXT NOT NULL REFERENCES users(id),
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deletedAt TEXT
);

CREATE TABLE images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  objectType TEXT NOT NULL DEFAULT 'REPORT' CHECK (objectType = 'REPORT'),
  objectId INTEGER NOT NULL REFERENCES reports(id),
  objectKey TEXT NOT NULL,
  blurDataUrl TEXT,
  height INTEGER,
  width INTEGER,
  hexColor TEXT,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deletedAt TEXT
);

CREATE TABLE changelog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  objectType TEXT NOT NULL DEFAULT 'REPORT' CHECK (objectType = 'REPORT'),
  objectId INTEGER REFERENCES reports(id),
  creatorId TEXT NOT NULL REFERENCES users(id),
  oldValue TEXT NOT NULL CHECK (json_valid(oldValue)),
  newValue TEXT NOT NULL CHECK (json_valid(newValue)),
  objectAttr TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX reports_creator ON reports(creatorId);
CREATE INDEX reports_type ON reports(reportTypeId);
CREATE INDEX comments_report ON comments(objectId, id);
CREATE INDEX images_report ON images(objectId, id);
CREATE INDEX images_key ON images(objectKey);
CREATE INDEX changelog_report ON changelog(objectId, id);

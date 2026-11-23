INSERT OR IGNORE INTO users (id, publicId, firstName, lastName)
VALUES ('f4f1d0ab-1056-41df-a177-de37456bf44c', 'fixture-author', 'Sample', 'Resident');

INSERT OR IGNORE INTO reportTypes (id, name, "group", markerColor)
VALUES (1, 'Pothole', 'Streets', '#175c85'),
       (2, 'Illegal Dumping', 'Sanitation', '#a45717');

INSERT OR IGNORE INTO reports (id, email, streetNumber, streetName, neighborhood, lat, lng, status, details, reportTypeId)
VALUES (311, 'fixture@example.invalid', 123, 'Elmwood Avenue', 'Elmwood Village',
        42.919, -78.877, 'OPEN', 'Synthetic pothole report near the intersection.', 1);

INSERT OR IGNORE INTO comments (id, objectId, content, creatorId)
VALUES (1, 311, 'Sample comment from a historical profile.', 'f4f1d0ab-1056-41df-a177-de37456bf44c');

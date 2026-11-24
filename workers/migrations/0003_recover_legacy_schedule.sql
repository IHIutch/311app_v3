-- The legacy date picker logged local-midnight values. Buffalo midnight was
-- recorded as 04:00Z or 05:00Z, so the first ten characters preserve the day.
WITH legacy_schedule AS (
  SELECT objectId, substr(json_extract(newValue, '$'), 1, 10) AS day,
         row_number() OVER (PARTITION BY objectId ORDER BY id DESC) AS rank
  FROM changelog
  WHERE objectAttr = 'scheduledDate' AND objectType = 'REPORT'
)
UPDATE reports
SET scheduledDate = legacy_schedule.day
FROM legacy_schedule
WHERE reports.id = legacy_schedule.objectId AND legacy_schedule.rank = 1
  AND reports.status = 'SCHEDULED' AND reports.deletedAt IS NULL AND reports.scheduledDate IS NULL
  AND legacy_schedule.day GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
  AND date(legacy_schedule.day, '+0 days') = legacy_schedule.day;

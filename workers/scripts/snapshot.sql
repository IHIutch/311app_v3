BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL TIME ZONE 'UTC';

SELECT jsonb_build_object(
  'Users', (SELECT coalesce(jsonb_agg(u ORDER BY u.id), '[]') FROM public."Users" u),
  'ReportTypes', (SELECT coalesce(jsonb_agg(t ORDER BY t.id), '[]') FROM public."ReportTypes" t),
  'Reports', (SELECT coalesce(jsonb_agg(r ORDER BY r.id), '[]') FROM public."Reports" r),
  'Comments', (SELECT coalesce(jsonb_agg(c ORDER BY c.id), '[]') FROM public."Comments" c),
  'Images', (SELECT coalesce(jsonb_agg(i ORDER BY i.id), '[]') FROM public."Images" i),
  'Changelog', (
    SELECT coalesce(jsonb_agg(
      to_jsonb(c) || jsonb_build_object('oldValue', c."oldValue"::text, 'newValue', c."newValue"::text)
      ORDER BY c.id
    ), '[]') FROM public."Changelog" c
  ),
  'Storage', (
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'bucket', bucket_id, 'name', name, 'size', metadata->>'size', 'type', metadata->>'mimetype'
    ) ORDER BY bucket_id, name), '[]')
    FROM storage.objects
  )
);

COMMIT;

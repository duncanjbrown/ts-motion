DECLARE time_interval INT64 DEFAULT 1; -- set the number of minutes to consider

WITH
  domains AS (
  SELECT
    'git' AS slug,
    'getintoteaching.education.gov.uk' AS host
  UNION ALL
  SELECT
    'apply',
    'www.apply-for-teacher-training.service.gov.uk'
  UNION ALL
  SELECT
    'find',
    'www.find-postgraduate-teacher-training.service.gov.uk'
  ),
  reqs AS (
  SELECT
    domains.slug as origin,
    'apply' AS destination
  FROM `rugged-abacus-218110.apply_events_production.events`
  LEFT JOIN domains ON domains.host = NET.HOST(request_referer)
  WHERE
    occurred_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL time_interval + 1 MINUTE)
    AND occurred_at <= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL time_interval MINUTE)
    AND event_type = "web_request"
    AND (request_referer IS NULL OR NET.HOST(request_referer) IN (SELECT host from domains where slug != 'apply'))
    GROUP BY origin
  UNION ALL
  SELECT
    domains.slug as origin,
    'find' AS destination
  FROM `rugged-abacus-218110.publish_api_events_production.events`
  LEFT JOIN domains ON domains.host = NET.HOST(request_referer)
  WHERE
    namespace = 'find'
    AND occurred_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL time_interval + 1 MINUTE)
    AND occurred_at <= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL time_interval MINUTE)
    AND event_type = "web_request"
    AND (request_referer IS NULL OR NET.HOST(request_referer) IN (SELECT host from domains where slug != 'find'))
    GROUP BY origin
  ),
  events AS (
    SELECT
    CASE
      when d.key = 'sent_to_provider_at' THEN 'submitted'
      when d.key = 'recruited_at' THEN 'recruited'
    END as world_event_type,
    'apply' AS origin
    FROM
      `rugged-abacus-218110.apply_events_production.events`
    JOIN UNNEST(data) as d
    WHERE
      event_type = 'update_entity'
      AND entity_table_name = 'application_choices'
      AND d.key IN ('sent_to_provider_at', 'recruited_at')
      AND occurred_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL time_interval + 1 MINUTE)
      AND ARRAY_LENGTH(d.value) > 0
      AND TIMESTAMP(d.value[0]) >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL time_interval + 1 MINUTE)
      AND TIMESTAMP(d.value[0]) <= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL time_interval + 1 MINUTE) 
  )

SELECT
  COUNT(*) as rate, 'referral' as event_type, origin, destination
FROM
  reqs
GROUP BY
origin, destination
UNION ALL
SELECT
  COUNT(*) as rate, world_event_type as event_type, origin, NULL as destination
FROM
  events
GROUP BY
origin, event_type



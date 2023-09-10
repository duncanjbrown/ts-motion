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
    occurred_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 20 MINUTE)
    AND occurred_at <= CURRENT_TIMESTAMP()
    AND event_type = "web_request"
    AND (request_referer IS NULL OR NET.HOST(request_referer) IN (SELECT host from domains where slug != 'apply'))
    GROUP BY anonymised_user_agent_and_ip, origin
  UNION ALL
  SELECT
    domains.slug as origin,
    'find' AS destination
  FROM `rugged-abacus-218110.publish_api_events_production.events`
  LEFT JOIN domains ON domains.host = NET.HOST(request_referer)
  WHERE
    namespace = 'find'
    AND occurred_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 20 MINUTE)
    AND occurred_at <= CURRENT_TIMESTAMP()
    AND event_type = "web_request"
    AND (request_referer IS NULL OR NET.HOST(request_referer) IN (SELECT host from domains where slug != 'find'))
    GROUP BY anonymised_user_agent_and_ip, origin
  ),
  events AS (
   SELECT COUNT(*), 'submitted' as event_type, 'apply' as origin from `dataform.application_choice_details` where submitted_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 20 MINUTE)
   UNION ALL
   SELECT COUNT(*), 'recruited' as event_type, 'apply' as origin from `dataform.application_choice_details` where recruited_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 20 MINUTE)
   UNION ALL
   SELECT COUNT(*), 'qts' as event_type, 'register' as origin from `dataform.trainees_latest_register` where awarded_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 20 MINUTE)
  )

SELECT
  COUNT(*), 'referral' as event_type, origin, destination, ROUND(COUNT(*) / (20 * 20), 3) AS rate,
FROM
  reqs
GROUP BY
origin, destination
UNION ALL
SELECT
  COUNT(*), event_type, origin, NULL as destination, ROUND(COUNT(*) / (20 * 20), 3) AS rate,
FROM
  events
GROUP BY
origin, event_type




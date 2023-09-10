type Service = {
  /**
    * Period in seconds over which metrics have been calculated
    */
  timeframe: number,
  /**
    * A unique name for this service, to be used as an identifier
    */
  name: string,
  /**
    * How this service will be labelled in sim
    */
  displayName: string,
  host: string,
  theme: string,
  /**
    * Referrals leaving this service
    */
  outbound: {[key: string]: { rate: number }},
  /**
    * External traffic reaching this service
    */
  inbound: {[key: string]: { rate: number }},
  /**
    * Stuff happening on this service
    */
  events: {[key: string]: { rate: number }},
}

export default Service;

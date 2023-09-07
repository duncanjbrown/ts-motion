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
  uniques: number,
  /**
    * Referrals leaving this service
    */
  outbound: [{
    destination: string,
    rate: number,
  }?],
  colour: string,
  /**
    * External traffic reaching this service
    */
  inbound: {
    rate: number
  }
}

export default Service;

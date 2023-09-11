type ServiceUpdate = {
  name: string,
  outbound: {[key: string]: { rate: number }},
  inbound: {[key: string]: { rate: number }},
  events: {[key: string]: { rate: number }},
  orbit: { rate: number },
}

export default ServiceUpdate;

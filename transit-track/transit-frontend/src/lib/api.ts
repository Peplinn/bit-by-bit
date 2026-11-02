import type { BusDescription } from './types'

// Sends a rider's description of a bus for review.
// TODO: POST to the owner's API once it has an endpoint for this. Until then nothing is
// stored; the description is only logged to the browser console.
export async function submitBusDescription(description: BusDescription): Promise<void> {
  console.info('Bus description (not sent anywhere yet):', description)
}

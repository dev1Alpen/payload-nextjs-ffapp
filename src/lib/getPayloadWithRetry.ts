import { getPayload } from 'payload'

/**
 * Get Payload instance with retry logic for connection exhaustion
 */
export async function getPayloadWithRetry(config: any, maxRetries = 3) {
  const configResolved = await config
  let retries = maxRetries
  
  while (retries > 0) {
    try {
      const payload = await getPayload({ config: configResolved })
      return payload
    } catch (error: any) {
      if (error?.message?.includes('connection slots') && retries > 1) {
        // Wait before retrying if connection slots are exhausted
        const waitTime = 1000 * (maxRetries - retries + 1)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        retries--
      } else {
        throw error
      }
    }
  }
  
  throw new Error('Failed to connect to database after retries')
}


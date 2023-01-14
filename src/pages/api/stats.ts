// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import getTracker from '@/lib/StatsTracker';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const tracker = getTracker();
  const stats = await tracker.getAllStats(30);
  res.status(200).json(stats);
}

import DownloadChart from '@/components/DownloadChart'
import FollowerChart from '@/components/FollowerChart';
import useRequest from '@/hooks/useRequest'
import { StatisticsResponse } from '@/types/StatisticsResponse'
import Head from 'next/head'

export default function Home({ data }: { data: StatisticsResponse[] }) {

  const [stats, loaded] = useRequest('/api/stats');

  return (
    <>
      <Head>
        <title>Modrinth downloads tracker</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-full py-5">
        <div className="mx-auto max-w-[80rem] h-full">
          <div className="bg-[#26292F] rounded-lg inline-block w-full p-5">
            <h1 className="font-bold text-2xl text-center">Downloads</h1>
            {loaded && <DownloadChart data={stats} />}
          </div>
          <div className="mx-auto max-w-[80rem] h-full">
            <div className="mt-12 bg-[#26292F] rounded-lg inline-block w-full p-5">
              <h1 className="font-bold text-2xl text-center">Followers</h1>
              {loaded && <FollowerChart data={stats} />}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

import DownloadChart from '@/components/DownloadChart'
import FollowerChart from '@/components/FollowerChart';
import MultiSelect from '@/components/form/MultiSelect';
import useRequest from '@/hooks/useRequest'
import { StatisticsResponse } from '@/types/StatisticsResponse'
import Head from 'next/head'
import { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { ComputeSMA, makePrediction } from '@/lib/modelUtils';
import { string } from '@tensorflow/tfjs-node';

export default function Home({ data }: { data: StatisticsResponse[] }) {

  const [stats, loaded] = useRequest('/api/stats');
  const [selectedProjects, setSelectedProjects] = useState<{ name: string; value: string }[]>([]);
  const [filteredStats, setFilteredStats] = useState<any>([]);

  const [uniqueProjects, setUniqueProjects] = useState<{ name: string; id: string; }[]>([]);
  const [futureData, setFutureData] = useState<{ id: string; day: Number; downloads: number }[]>([]);

  useEffect(() => setUniqueProjects(loaded ? filterUniqueProjects(stats) : []), [stats, loaded]);

  useEffect(() => {
    if (selectedProjects.length === 0) {
      setFilteredStats(undefined);
    } else {
      setFilteredStats(stats.filter((item: any) => selectedProjects.some(proj => proj.value === item.project_id)));
    }
  }, [stats, selectedProjects]);

  const getLatestDownloads = (project: string) => {
    const latest = stats.filter((item: any) => item.project_id === project).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    return latest?.downloads ?? 0;
  }

  const filterUniqueProjects = (projects: { name: string; project_id: string; }[]) => {
    const unique: any[] = [];
    projects.forEach((project) => {
      if (!unique.some((item: any) => item.id === project.project_id)) {
        unique.push({ name: project.name, id: project.project_id });
      }
    });
    return unique;
  }

  useEffect(() => {
    if (uniqueProjects.length === 0) return;
    for (const project of uniqueProjects) {
      tf.loadLayersModel(`${process.env.NEXT_PUBLIC_MODEL_URL}/${project.id}/model.json`).then((model) => {
        fetch(`${process.env.NEXT_PUBLIC_MODEL_URL}/${project.id}/normalize.json`).then((res) => res.json()).then((data) => {
          const window_size = 3;
          const sma_vec = ComputeSMA(stats.filter((item: any) => item.project_id === project.id), window_size);
          let inputs = sma_vec.map(inp_f => inp_f['set'].map(val => parseInt(val.downloads)));

          let pred_X = [inputs[inputs.length - 1]];
          const daysAhead = 10;
          // Predict the upcoming 10 days
          for (let i = 0; i < daysAhead; i++) {
            let pred_y = makePrediction(pred_X, model, data.normalize);
            setFutureData([...futureData, { id: project.id, day: i + 1, downloads: Math.round(pred_y[0]) }]);
            pred_X[0].shift();
            pred_X[0].push(Math.round(pred_y[0]));
            console.log(`${project.name} day ${i + 1}: ${Math.round(pred_y[0])} downloads`)
          }
        }).catch((e) => console.log(e));
      }).catch((e) => console.log(e));
    }
  }, [uniqueProjects])

  return (
    <>
      <Head>
        <title>Modrinth downloads tracker</title>
        <meta name="description" content="Download & follower statistics of the modrinth datapacks" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-full py-5">
        <div className="mx-auto max-w-[80rem] h-full">
          <div className="bg-[#26292F] rounded-lg p-3 grid grid-cols-3 h-16">
            <div className="col-span-2 relative">
              <MultiSelect options={uniqueProjects.sort((a, b) => getLatestDownloads(b.id) - getLatestDownloads(a.id)).map((project) => { return { name: project.name, value: project.id } })} standard={""} selected={selectedProjects} setSelected={setSelectedProjects} />
            </div>
          </div>
          <div className="bg-[#26292F] rounded-xl inline-block w-full p-5 mt-5 -z-50">
            <h1 className="font-bold text-2xl text-center bg-clip-text bg-gradient-to-b from-green-500 to-green-400 text-transparent">Downloads</h1>
            {loaded && <DownloadChart data={filteredStats ?? stats} />}
          </div>
          <div className="mx-auto max-w-[80rem] h-full">
            <div className="mt-12 bg-[#26292F] rounded-lg inline-block w-full p-5">
              <h1 className="font-bold text-2xl text-center bg-clip-text bg-gradient-to-b from-green-500 to-green-400 text-transparent">Followers</h1>
              {loaded && <FollowerChart data={filteredStats ?? stats} />}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

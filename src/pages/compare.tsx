import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Select from '@/components/form/Select'
import useRequest from '@/hooks/useRequest'
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DownloadChart from '@/components/DownloadChart';
import FollowerChart from '@/components/FollowerChart';
import Toggle from '@/components/form/Toggle';
import AverageGrowthChart from '@/components/AverageGrowthChart';
import Link from 'next/link';
import Image from 'next/image';
import MultiSelect from '@/components/form/MultiSelect';
import { ModrinthProject } from '@/types/ModrinthAPI';
import { StatisticsResponse } from '@/types/StatisticsResponse';

const Dashboard = () => {


    const [projectStatistics, loadedProjectStatistics] = useRequest<any>('/api/stats');
    const [projects, setProjects] = useState<{ name: string; id: string; }[]>([]);

    const [project1, setProject1] = useState<{ name: string; value: string; }>();
    const [modrinthProject1, setModrinthProject1] = useState<ModrinthProject>();
    const [project1Data, setProject1Data] = useState<StatisticsResponse[]>([]);

    const [project2, setProject2] = useState<{ name: string; value: string; }>();
    const [modrinthProject2, setModrinthProject2] = useState<ModrinthProject>();
    const [project2Data, setProject2Data] = useState<StatisticsResponse[]>([]);

    useEffect(() => {
        if (project1) fetch(`https://api.modrinth.com/v2/project/${project1.value}`).then((res) => res.json()).then((data) => setModrinthProject1(data));
        if (project1) setProject1Data(projectStatistics.filter((item: any) => item.project_id === project1.value));
    }, [project1, projectStatistics]);
    useEffect(() => {
        if (project2) fetch(`https://api.modrinth.com/v2/project/${project2.value}`).then((res) => res.json()).then((data) => setModrinthProject2(data));
        if (project2) setProject2Data(projectStatistics.filter((item: any) => item.project_id === project2.value));
    }, [project2, projectStatistics]);

    /**
     * Manages filtering the unique projects
     */
    useEffect(() => {
        if (!projectStatistics) return;
        setProjects(loadedProjectStatistics ? filterUniqueProjects(projectStatistics) : []);
    }, [projectStatistics, loadedProjectStatistics]);

    const filterUniqueProjects = (projects: { name: string; project_id: string; }[]) => {
        const unique: any[] = [];
        projects.forEach((project) => {
            if (!unique.some((item: any) => item.id === project.project_id)) {
                unique.push({ name: project.name, id: project.project_id });
            }
        });
        return unique;
    }

    /**
     * Calculates the % increase from now and the previous day
     */
    const calculateDownloadIncrease = (pastStatistics: StatisticsResponse[], currentStatistics: ModrinthProject) => {
        if (!pastStatistics.length || !currentStatistics) return 0;

        const receivedYesterday = pastStatistics[pastStatistics.length - 1].downloads - pastStatistics[pastStatistics.length - 2].downloads;
        const receivedToday = currentStatistics.downloads - pastStatistics[pastStatistics.length - 1].downloads;

        if (receivedYesterday === receivedToday) {
            return 0;
        }

        return Math.round(((receivedToday - receivedYesterday) / receivedYesterday * 100) * 100) / 100;
    }

    const calculateFollowIncrease = (pastStatistics: StatisticsResponse[], currentStatistics: ModrinthProject) => {
        if (!pastStatistics.length || !currentStatistics) return 0;

        const receivedYesterday = pastStatistics[pastStatistics.length - 1].follows - pastStatistics[pastStatistics.length - 2].follows;
        const receivedToday = currentStatistics.followers - pastStatistics[pastStatistics.length - 1].follows;

        if (receivedYesterday === receivedToday) {
            return 0;
        }

        return Math.round(((receivedToday - receivedYesterday) / receivedYesterday * 100) * 100) / 100;
    }


    return (
        <>
            <Head>
                <title>Modrinth datapack tracker | Compare</title>
                <meta name="description" content="Dashboard for everything :D" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="h-full py-10 px-5 sm:px-10">
                <div className="mx-auto sm:max-w-[80vw] h-full">
                    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-24">
                        <div className="flex flex-col gap-5">
                            <div className="bg-card rounded-lg p-3 flex flex-wrap justify-center content-center">
                                <div className="w-3/4 lg:w-1/2">
                                    <Select selected={project1} setSelected={setProject1} options={projects.map((item) => ({ name: item.name, value: item.id })).sort((a, b) => a.name.localeCompare(b.name))} />
                                </div>
                                <Link href={`https://modrinth.com/project/${project1?.value || ''}`} className="ml-2 flex items-center border-primarygreen border-2 rounded-lg p-1">
                                    <Image src="/modrinth-logo.svg" alt="modrinth-logo" width={24} height={24} className="inline-block" />
                                    <span className="text-primarygreen font-medium ml-1">Modrinth</span>
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <StatisticsTopCard title="Downloads" value={modrinthProject1?.downloads.toString() || '?'} />
                                <StatisticsTopCard title="Downloads today" value={(modrinthProject1?.downloads! - project1Data[project1Data.length - 1].downloads).toString()} percent={calculateDownloadIncrease(project1Data, modrinthProject1!)} />
                                <StatisticsTopCard title="Followers" value={modrinthProject1?.followers.toString() || '?'} />
                                <StatisticsTopCard title="Followers today" value={(modrinthProject1?.followers! - project1Data[project1Data.length - 1].follows).toString()} percent={calculateFollowIncrease(project1Data, modrinthProject1!)} />
                            </div>
                            <div className="bg-card rounded-lg p-3 w-full">
                                <h2 className="text-inputtext text-2xl font-bold text-center">Downloads</h2>
                                <DownloadChart data={project1Data ? [...project1Data, { id: (project1Data[project1Data.length - 1]?.id + 1), project_id: project1?.value, downloads: modrinthProject1?.downloads, follows: modrinthProject1?.followers, date: "TODAY" } as StatisticsResponse] : []} futureData={[]} />
                            </div>
                            <div className="bg-card rounded-lg p-3 w-full">
                                <h2 className="text-inputtext text-2xl font-bold text-center">Growth</h2>
                                <AverageGrowthChart label={"downloads"} data={project1Data ? [...project1Data, { id: (project1Data[project1Data.length - 1]?.id + 1), project_id: project1?.value, downloads: modrinthProject1?.downloads, follows: modrinthProject1?.followers, date: "TODAY" } as StatisticsResponse] : []} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-5">
                            <div className="bg-card rounded-lg p-3 flex flex-wrap justify-center content-center">
                                <div className="w-3/4 lg:w-1/2">
                                    <Select selected={project2} setSelected={setProject2} options={projects.map((item) => ({ name: item.name, value: item.id })).sort((a, b) => a.name.localeCompare(b.name))} />
                                </div>
                                <Link href={`https://modrinth.com/project/${project1?.value || ''}`} className="ml-2 flex items-center border-primarygreen border-2 rounded-lg p-1">
                                    <Image src="/modrinth-logo.svg" alt="modrinth-logo" width={24} height={24} className="inline-block" />
                                    <span className="text-primarygreen font-medium ml-1">Modrinth</span>
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <StatisticsTopCard title="Downloads" value={modrinthProject2?.downloads.toString() || '?'} />
                                <StatisticsTopCard title="Downloads today" value={(modrinthProject2?.downloads! - project2Data[project2Data.length - 1].downloads).toString()} percent={calculateDownloadIncrease(project2Data, modrinthProject2!)} />
                                <StatisticsTopCard title="Followers" value={modrinthProject2?.followers.toString() || '?'} />
                                <StatisticsTopCard title="Followers today" value={(modrinthProject2?.followers! - project2Data[project2Data.length - 1].follows).toString()} percent={calculateFollowIncrease(project2Data, modrinthProject2!)} />
                            </div>
                            <div className="bg-card rounded-lg p-3 w-full">
                                <h2 className="text-inputtext text-2xl font-bold text-center">Downloads</h2>
                                <DownloadChart data={project2Data ? [...project2Data, { id: (project2Data[project2Data.length - 1]?.id + 1), project_id: project2?.value, downloads: modrinthProject2?.downloads, follows: modrinthProject2?.followers, date: "TODAY" } as StatisticsResponse] : []} futureData={[]} />
                            </div>
                            <div className="bg-card rounded-lg p-3 w-full">
                                <h2 className="text-inputtext text-2xl font-bold text-center">Growth</h2>
                                <AverageGrowthChart label={"Downloads"} data={project2Data ? [...project2Data, { id: (project2Data[project2Data.length - 1]?.id + 1), project_id: project2?.value, downloads: modrinthProject2?.downloads, follows: modrinthProject2?.followers, date: "TODAY" } as StatisticsResponse] : []} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

const StatisticsTopCard = ({ title, value, percent }: { title: string, value: string, percent?: number }) => {
    return (
        <div className="bg-card rounded-lg p-5 px-7">
            <div>
                <h2 className="text-inputtext font-bold text-lg">{title}</h2>
            </div>
            <div className="flex items-center mt-2">
                <span className="text-white font-bold text-5xl inline-block">{value}</span>
                <div className="ml-2 align-middle">
                    {percent !== undefined && (
                        <div className={`rounded-lg p-1 ${percent >= 0 ? 'bg-green-300' : 'bg-red-300'}`}>
                            {percent >= 0 ? <FontAwesomeIcon icon={faCaretUp} height={18} className="text-green-600 inline-block" /> : <FontAwesomeIcon icon={faCaretDown} height={18} className="text-red-600 inline-block" />}
                            <span className={`inline-block ml-2 text-sm ${percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>{Math.abs(percent)}%</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard

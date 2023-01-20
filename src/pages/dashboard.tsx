import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Select from '@/components/form/Select'
import useRequest from '@/hooks/useRequest'
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ModrinthProject } from '@/types/ModrinthAPI';
import DownloadChart from '@/components/DownloadChart';
import { useRouter } from 'next/router';
import FollowerChart from '@/components/FollowerChart';
import Toggle from '@/components/form/Toggle';
import AverageGrowthChart from '@/components/AverageGrowthChart';
import Link from 'next/link';
import Image from 'next/image';

const Dashboard = () => {

    const router = useRouter();
    const projectId = (router.query.project || "5y2R1ofr") as string;

    const [project, setProject] = useState<{ name: string; value: string; }>();
    const [modrinthProject, setModrinthProject] = useState<ModrinthProject | undefined>();

    const [modrinthProjectListings, loadedModrinthProjectListings] = useRequest<{ hits: ModrinthProject[] }>('https://api.modrinth.com/v2/search?limit=20&index=relevance&facets=[[%22categories:%27datapack%27%22],[%22project_type:mod%22]]');
    const [stats, loaded] = useRequest<any>('/api/stats');
    const [uniqueProjects, setUniqueProjects] = useState<{ name: string; id: string; }[]>([]);

    const [selectedProjectStats, setSelectedProjectStats] = useState<any>([]);
    const [futureProjectStats, setFutureProjectStats] = useState<any>([]);
    const [showFuture, setShowFuture] = useState<boolean>(false);

    useEffect(() => {
        if (!stats) return;

        setUniqueProjects(loaded ? filterUniqueProjects(stats) : []);
        const projectStat = stats.filter((f: any) => f.project_id === projectId)[0];
        if (projectStat) {
            setProject({ name: projectStat.name, value: projectStat.project_id });
        }
    }, [stats, loaded, projectId]);

    const filterUniqueProjects = (projects: { name: string; project_id: string; }[]) => {
        const unique: any[] = [];
        projects.forEach((project) => {
            if (!unique.some((item: any) => item.id === project.project_id)) {
                unique.push({ name: project.name, id: project.project_id });
            }
        });
        return unique;
    }

    const setProjectFunction = (value: { name: string; value: string; }) => {
        setProject(value);
        router.push(`/dashboard?project=${value.value}`, undefined, { shallow: true });
    }

    const fetchModrinthData = async (id: string) => {
        const res = await fetch(`https://api.modrinth.com/v2/project/${id}`).catch((err) => console.error(err));
        if (!res) {
            return;
        }

        const data = await res.json();
        setModrinthProject(data);
    }

    const fetchFutureData = async (id: string) => {
        const result = await fetch(`${process.env.NEXT_PUBLIC_MODEL_URL}/${id}/future.json`).then((res) => res.json());
        setFutureProjectStats(result);
    }

    const getTopDownloadedProjectsYesterday = () => {
        if (!stats) return [];
        const downloadedProjects: { name: string; downloads: number }[] = [];

        for (const proj of uniqueProjects) {
            const projectStats = stats.filter((item: any) => item.project_id === proj.id);
            if (projectStats.length > 0) {
                downloadedProjects.push({ name: proj.name, downloads: (projectStats[projectStats.length - 1].downloads - projectStats[projectStats.length - 2]?.downloads) });
            }
        }

        return downloadedProjects.sort((a, b) => b.downloads - a.downloads).slice(0, 6);
    }

    const getTopDownloadedProjectsToday = () => {
        if (!loadedModrinthProjectListings || !loaded) return [];
        const downloadedProjects: { name: string; downloads: number }[] = [];

        for (const proj of modrinthProjectListings!.hits) {
            const projectStats = stats.filter((item: any) => item.project_id === proj.project_id);
            if (projectStats.length > 0) {
                downloadedProjects.push({ name: proj.title, downloads: proj.downloads - projectStats[projectStats.length - 1].downloads });
            }
        }

        return downloadedProjects.sort((a, b) => b.downloads - a.downloads).slice(0, 6);
    }

    useEffect(() => {
        if (!loaded || !project || !stats) return;
        setSelectedProjectStats(stats.filter((item: any) => item.project_id === project.value).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        fetchModrinthData(project.value);
        fetchFutureData(project.value);
    }, [stats, project, loaded]);

    const calculateDownloadPercentage = () => {
        if (!selectedProjectStats.length) return 0;

        const downloadsReceivedYesterday = selectedProjectStats[selectedProjectStats.length - 1].downloads - selectedProjectStats[selectedProjectStats.length - 2]?.downloads;
        const downloadsReceivedToday = (modrinthProject?.downloads ?? 0) - selectedProjectStats[selectedProjectStats.length - 1].downloads;

        if (downloadsReceivedYesterday === downloadsReceivedToday) {
            return 0;
        }

        if (downloadsReceivedToday > downloadsReceivedYesterday) {
            return downloadsReceivedYesterday > 0 ? Math.round((downloadsReceivedToday / downloadsReceivedYesterday) * 100) / 100 : downloadsReceivedToday * 100;
        }

        return downloadsReceivedYesterday > 0 ? Math.round((downloadsReceivedToday - downloadsReceivedYesterday) / downloadsReceivedYesterday * 10000) / 100 : downloadsReceivedYesterday;
    }

    const calculateFollowersPercentage = () => {
        if (!selectedProjectStats.length) return 0;

        const followsReceivedYesterday = selectedProjectStats[selectedProjectStats.length - 1].follows - selectedProjectStats[selectedProjectStats.length - 2]?.follows;
        const followsReceivedToday = (modrinthProject?.followers ?? 0) - selectedProjectStats[selectedProjectStats.length - 1].follows;


        if (followsReceivedYesterday === followsReceivedToday) {
            return 0;
        }

        if (followsReceivedToday > followsReceivedYesterday) {
            return followsReceivedYesterday > 0 ? Math.round((followsReceivedToday / followsReceivedYesterday) * 100) / 100 : followsReceivedToday * 100;
        }

        return followsReceivedYesterday > 0 ? Math.round((followsReceivedToday - followsReceivedYesterday) / followsReceivedYesterday * 10000) / 100 : followsReceivedYesterday;
    }

    return (
        <>
            <Head>
                <title>Modrinth downloads tracker | Dashboard</title>
                <meta name="description" content="Dashboard for everything :D" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="h-full p-10">
                <div className="mx-auto max-w-[80vw] h-full">
                    {/* Top level selection */}
                    <div className="bg-card rounded-lg p-3 flex justify-center content-center">
                        <div className="w-3/4 lg:w-1/2">
                            <Select selected={project} setSelected={setProjectFunction} options={uniqueProjects.map((item) => ({ name: item.name, value: item.id })).sort((a, b) => a.name.localeCompare(b.name))} />
                        </div>
                        <Link href={`https://modrinth.com/project/${project?.value || '5y2R1ofr'}`} className="ml-2 flex items-center border-primarygreen border-2 rounded-lg p-1">
                            <Image src="/modrinth-logo.svg" alt="modrinth-logo" width={24} height={24} className="inline-block" />
                            <span className="text-primarygreen font-medium ml-1">Modrinth</span>
                        </Link>
                    </div>

                    {/* Quick statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
                        <StatisticsTopCard title="Downloads" value={modrinthProject?.downloads.toString() ?? "?"} />
                        <StatisticsTopCard title="Followers" value={modrinthProject?.followers.toString() ?? "?"} />
                        <StatisticsTopCard title="Downloads today" value={((modrinthProject?.downloads ?? 0) - selectedProjectStats[selectedProjectStats.length - 1]?.downloads).toString() ?? "?"} percent={calculateDownloadPercentage()} />
                        <StatisticsTopCard title="Follows today" value={((modrinthProject?.followers ?? 0) - selectedProjectStats[selectedProjectStats.length - 1]?.follows).toString() ?? "?"} percent={calculateFollowersPercentage()} />
                    </div>

                    {/* Segment for sidebar */}
                    <div className="grid grid-cols-1 2xl:grid-cols-4 gap-4">

                        {/* Sidebar today*/}
                        <div className="bg-card rounded-lg p-3 w-full mt-5 2xl:col-start-1 2xl:col-end-2 2xl:row-start-1 2xl:row-end-2">
                            <h2 className="text-inputtext text-2xl font-bold text-center">Top downloads today</h2>
                            <DownloadsTable data={getTopDownloadedProjectsToday()} />
                        </div>

                        {/* Sidebar yesterday*/}
                        <div className="bg-card rounded-lg p-3 w-full mt-5 2xl:col-start-1 2xl:col-end-2 2xl:row-start-2 2xl:row-end-3">
                            <h2 className="text-inputtext text-2xl font-bold text-center">Top downloads yesterday</h2>
                            <DownloadsTable data={getTopDownloadedProjectsYesterday()} />
                        </div>

                        {/* Download chart */}
                        <div className="bg-card rounded-lg p-3 w-full mt-5 2xl:col-span-3">
                            <div className="text-inputtext text-2xl font-bold text-center relative">
                                Downloads
                            </div>

                            <DownloadChart data={project ? [...selectedProjectStats, { id: (selectedProjectStats[selectedProjectStats.length - 1]?.id + 1), project_id: project.value, downloads: modrinthProject?.downloads, follows: modrinthProject?.followers, date: "TODAY" }] : []} futureData={showFuture ? futureProjectStats : []} />
                            <div className="flex justify-center">
                                <Toggle toggled={showFuture} setToggled={setShowFuture} text="Show future predictions" />
                            </div>
                        </div>

                        {/* Growth chart */}
                        <div className="bg-card rounded-lg p-3 w-full mt-5 2xl:col-span-3">
                            <h2 className="text-inputtext text-2xl font-bold text-center">Growth</h2>
                            <AverageGrowthChart label={"downloads"} data={project ? [...selectedProjectStats, { id: (selectedProjectStats[selectedProjectStats.length - 1]?.id + 1), project_id: project.value, downloads: modrinthProject?.downloads, follows: modrinthProject?.followers, date: "TODAY" }] : []} />
                        </div>

                        {/* Followers chart */}
                        <div className="bg-card rounded-lg p-3 w-full mt-5 2xl:col-span-3 2xl:col-start-2 2xl:col-end-5">
                            <h2 className="text-inputtext text-2xl font-bold text-center">Follows</h2>
                            <FollowerChart data={project ? [...selectedProjectStats, { id: (selectedProjectStats[selectedProjectStats.length - 1]?.id + 1), project_id: project.value, downloads: modrinthProject?.downloads, follows: modrinthProject?.followers, date: "TODAY" }] : []} />
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

const DownloadsTable = ({ data }: { data: { name: string; downloads: number }[] }) => {
    return <div className="relative overflow-x-auto mt-2 rounded-lg">
        <table className="w-full text-sm text-left text-inputtext">
            <thead className="text-xs bg-gray-700 text-gray-400">
                <tr>
                    <th className="px-6 py-3">Project</th>
                    <th className="px-6 py-3">Downloads</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, idx) => (
                    <tr key={idx} className="bg-background border-gray-700">
                        <th className="px-6 py-4 font-medium text-white">
                            {item.name}
                        </th>
                        <td className="px-6 py-4">
                            {item.downloads}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
}

export default Dashboard
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

const Dashboard = () => {

    const router = useRouter();
    const projectId = (router.query.project || "5y2R1ofr") as string;

    const [project, setProject] = useState<{ name: string; value: string; }>();
    const [modrinthProject, setModrinthProject] = useState<ModrinthProject | undefined>();

    const [stats, loaded] = useRequest('/api/stats');
    const [uniqueProjects, setUniqueProjects] = useState<{ name: string; id: string; }[]>([]);

    const [selectedProjectStats, setSelectedProjectStats] = useState<any>([]);

    useEffect(() => {
        setUniqueProjects(loaded ? filterUniqueProjects(stats) : []);
        const projectStat = uniqueProjects.find((item: any) => item.id === projectId);
        if (projectStat) {
            setProject({ name: projectStat.name, value: projectStat.id });
        }
    }, [stats, loaded]);

    const filterUniqueProjects = (projects: { name: string; project_id: string; }[]) => {
        const unique: any[] = [];
        projects.forEach((project) => {
            if (!unique.some((item: any) => item.id === project.project_id)) {
                unique.push({ name: project.name, id: project.project_id });
            }
        });
        return unique;
    }

    const fetchModrinthData = async (id: string) => {
        const res = await fetch(`https://api.modrinth.com/v2/project/${id}`);
        const data = await res.json();
        setModrinthProject(data);
    }

    useEffect(() => {
        if (!loaded || !project) return;
        setSelectedProjectStats(stats.filter((item: any) => item.project_id === project.value).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        fetchModrinthData(project.value);

        router.query.project = project.value;
        router.push(router);
    }, [stats, project, loaded]);

    const calculateDownloadPercentage = () => {
        if (!selectedProjectStats.length) return 0;

        const downloadsReceivedYesterday = selectedProjectStats[selectedProjectStats.length - 1].downloads - selectedProjectStats[selectedProjectStats.length - 2].downloads;
        const downloadsReceivedToday = (modrinthProject?.downloads ?? 0) - selectedProjectStats[selectedProjectStats.length - 1].downloads;

        if (downloadsReceivedYesterday === downloadsReceivedToday) {
            return 0;
        }

        if (downloadsReceivedToday > downloadsReceivedYesterday) {
            return Math.round((downloadsReceivedToday / downloadsReceivedYesterday) * 100) / 100;
        }

        return Math.round(((downloadsReceivedYesterday) / downloadsReceivedToday) * 100) / 100 * -1;
    }

    const calculateFollowersPercentage = () => {
        if (!selectedProjectStats.length) return 0;

        const followsReceivedYesterday = selectedProjectStats[selectedProjectStats.length - 1].follows - selectedProjectStats[selectedProjectStats.length - 2].follows;
        const followsReceivedToday = (modrinthProject?.followers ?? 0) - selectedProjectStats[selectedProjectStats.length - 1].follows;


        if (followsReceivedYesterday === followsReceivedToday) {
            return 0;
        }

        if (followsReceivedToday > followsReceivedYesterday) {
            return followsReceivedYesterday > 0 ? Math.round((followsReceivedToday / followsReceivedYesterday) * 100) / 100 : followsReceivedToday * 100;
        }

        return followsReceivedToday > 0 ? Math.round(((followsReceivedYesterday) / followsReceivedToday) * 100) / 100 * -1 : followsReceivedYesterday * -100;
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
                        <div className="w-1/2">
                            <Select selected={project} setSelected={setProject} options={uniqueProjects.map((item) => ({ name: item.name, value: item.id }))} standard={projectId} />
                        </div>
                    </div>

                    {/* Quick statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
                        <StatisticsTopCard title="Downloads" value={modrinthProject?.downloads.toString() ?? "?"} />
                        <StatisticsTopCard title="Followers" value={modrinthProject?.followers.toString() ?? "?"} />
                        <StatisticsTopCard title="Downloads today" value={((modrinthProject?.downloads ?? 0) - selectedProjectStats[selectedProjectStats.length - 1]?.downloads).toString() ?? "?"} percent={calculateDownloadPercentage()} />
                        <StatisticsTopCard title="Follows today" value={((modrinthProject?.followers ?? 0) - selectedProjectStats[selectedProjectStats.length - 1]?.follows).toString() ?? "?"} percent={calculateFollowersPercentage()} />
                    </div>

                    {/* Download chart */}
                    <div className="bg-card rounded-lg p-3 w-full mt-5">
                        <h2 className="text-inputtext text-2xl font-bold text-center">Downloads</h2>
                        <DownloadChart data={project ? [...selectedProjectStats, { id: (selectedProjectStats[selectedProjectStats.length - 1]?.id + 1), project_id: project.value, downloads: modrinthProject?.downloads, follows: modrinthProject?.followers, date: "TODAY" }] : []} futureData={[]} />
                    </div>

                    {/* Followers chart */}
                    <div className="bg-card rounded-lg p-3 w-full mt-5">
                        <h2 className="text-inputtext text-2xl font-bold text-center">Follows</h2>
                        <FollowerChart data={project ? [...selectedProjectStats, { id: (selectedProjectStats[selectedProjectStats.length - 1]?.id + 1), project_id: project.value, downloads: modrinthProject?.downloads, follows: modrinthProject?.followers, date: "TODAY" }] : []} />
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
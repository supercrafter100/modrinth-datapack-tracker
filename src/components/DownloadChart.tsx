import tooltipCollector from '@/lib/recharts/tooltipCollector';
import { StatisticsResponse } from '@/types/StatisticsResponse'
import React, { useEffect } from 'react'
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, Legend } from 'recharts'
import CustomizedTick from '@/components/CustomizedTick';
import CustomTooltip from '@/components/CustomTooltip';
import { makeColorGradient } from '@/lib/generateColours';

const DownloadChart = ({ data, futureData }: { data: StatisticsResponse[], futureData: { id: string; day: number; downloads: number }[] }) => {

    const uniqueProjects = Array.from(new Set(data.map((item) => item.project_id)));
    const projectNames = uniqueProjects.map((proj) => ({ project_id: proj, project_name: data.find((item) => item.project_id === proj)?.name ?? "Unknown" }));
    const oneProjectData = data.filter((item) => item.project_id === uniqueProjects[0]);

    const projectData = oneProjectData.map((item) => {
        let obj: Record<string, string | number> = {};
        const d = new Date(item.date);

        obj["date"] = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
        for (const proj of uniqueProjects) {
            const projData = data.find((itm) => itm.project_id === proj && itm.date === item.date);
            obj[proj] = projData?.downloads ?? 0;
        }
        return obj;
    });

    // Add additional data. The date starts from the last date of the item in projectData
    const oneFutureProjectData = futureData.filter((item) => item.id === uniqueProjects[0])
    const futureProjectData = oneFutureProjectData.map((item) => {

        let obj: Record<string, string | number> = {};

        const lastDate = new Date(oneProjectData[oneProjectData.length - 1].date);
        lastDate.setDate(lastDate.getDate() + item.day);

        obj["date"] = lastDate.getDate() + "/" + (lastDate.getMonth() + 1) + "/" + lastDate.getFullYear();
        for (const proj of uniqueProjects) {
            const projData = futureData.find((itm) => itm.id === proj && itm.day === item.day);
            obj[proj] = projData?.downloads ?? 0
        }
        return obj;
    })

    const totalProjectData = [...projectData, ...futureProjectData];
    const percentLine = 100 - ((totalProjectData.length - projectData.length) / (totalProjectData.length - 1)) * 100;

    const THE_COLLECTOR = tooltipCollector();

    const center = 128;
    const width = 127;
    const frequency = 2.4;
    const colours = makeColorGradient(frequency, frequency, frequency, 0, 2, 4, center, width, uniqueProjects.length);

    return (
        <ResponsiveContainer width={"95%"} height={400}>
            <LineChart
                width={500}
                height={300}
                data={totalProjectData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5
                }}
            >
                <defs>
                    <linearGradient id="futureGradient" x1="0" y1="0" x2="100%" y2="0">
                        <stop offset="0%" stopColor="red" />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray={"3 3"} />
                <XAxis dataKey={"date"} />
                <YAxis allowDecimals={false} tick={<CustomizedTick THE_COLLECTOR={THE_COLLECTOR} />} domain={['auto', 'auto']} />
                <Tooltip itemSorter={(item) => (item.value as number) * -1} content={<CustomTooltip THE_COLLECTOR={THE_COLLECTOR} />} />
                {uniqueProjects.length < 10 && <Legend />}

                {uniqueProjects.map((proj, idx) => (
                    <>
                        <defs key={`${idx}-1`}>
                            <linearGradient id={`gradient-${proj}`} x1="0" y1="0" x2="100%" y2="0">
                                <stop offset="0%" stopColor={colours[idx]} />
                                <stop offset={`${percentLine}%`} stopColor={colours[idx]} />
                                <stop offset={`${percentLine}%`} stopColor={"#2FCD69"} />
                                <stop offset="100%" stopColor={"#2FCD69"} />
                            </linearGradient>
                        </defs>
                        <Line key={`${idx}-2`} type="monotone" dataKey={proj} name={projectNames.find((item) => item.project_id === proj)?.project_name} stroke={`url(#gradient-${proj})`} />

                    </>
                ))}
            </LineChart>
        </ResponsiveContainer>
    )
}

export default DownloadChart

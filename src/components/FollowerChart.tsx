import tooltipCollector from '@/lib/recharts/tooltipCollector';
import { StatisticsResponse } from '@/types/StatisticsResponse'
import React from 'react'
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, Legend } from 'recharts'
import CustomizedTick from '@/components/CustomizedTick';
import CustomTooltip from '@/components/CustomTooltip';
import { makeColorGradient } from '@/lib/generateColours';

const DownloadChart = ({ data }: { data: StatisticsResponse[] }) => {

    const uniqueProjects = Array.from(new Set(data.map((item) => item.project_id)));
    const projectNames = uniqueProjects.map((proj) => ({ project_id: proj, project_name: data.find((item) => item.project_id === proj)?.name ?? "Unknown" }));
    const oneProjectData = data.filter((item) => item.project_id === uniqueProjects[0]);

    const projectData = oneProjectData.map((item) => {
        let obj: Record<string, string | number> = {};
        const d = new Date(item.date);

        obj["date"] = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
        for (const proj of uniqueProjects) {
            const projData = data.find((itm) => itm.project_id === proj && itm.date === item.date);
            obj[proj] = projData?.follows ?? 0;
        }
        return obj;
    });

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
                data={projectData}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5
                }}
            >
                <CartesianGrid strokeDasharray={"3 3"} />
                <XAxis dataKey={"date"} />
                <YAxis allowDecimals={false} tick={<CustomizedTick THE_COLLECTOR={THE_COLLECTOR} />} />
                <Tooltip itemSorter={(item) => (item.value as number) * -1} content={<CustomTooltip THE_COLLECTOR={THE_COLLECTOR} />} />
                <Legend />

                {uniqueProjects.map((proj, idx) => <Line key={idx} type="monotone" dataKey={proj} name={projectNames.find((item) => item.project_id === proj)?.project_name} stroke={colours[idx]} />)}
            </LineChart>
        </ResponsiveContainer>
    )
}

export default DownloadChart
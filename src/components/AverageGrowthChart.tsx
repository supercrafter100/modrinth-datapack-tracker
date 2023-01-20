import tooltipCollector from '@/lib/recharts/tooltipCollector';
import { StatisticsResponse } from '@/types/StatisticsResponse'
import React from 'react'
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, Legend } from 'recharts'
import CustomizedTick from './CustomizedTick';
import CustomTooltip from './CustomTooltip';

const AverageGrowthChart = ({ data, label = "average" }: { data: StatisticsResponse[], label?: string }) => {

    const uniqueProjects = Array.from(new Set(data.map((item) => item.project_id)));
    const oneProjectData = data.filter((item) => item.project_id === uniqueProjects[0]);

    // Calculate the average downloads for each project, each day?
    const calculateDailyAverageDownloadCount = () => {

        const out: { date: string, average: number; }[] = [];

        for (let i = 0; i < oneProjectData.length; i++) {
            const item = oneProjectData[i];
            let total = 0;
            let count = 0;

            for (const proj of uniqueProjects) {
                const projData = data.find((itm) => itm.project_id === proj && itm.date === item.date);
                // Get the data before that
                const projDataBefore = data.find((itm) => itm.project_id === proj && itm.date === oneProjectData[i - 1]?.date);
                if (projData && projDataBefore) {
                    total += (projData.downloads - projDataBefore.downloads);
                    count++;
                }
            }

            let date: string;

            if (item.date !== "TODAY") {
                const d = new Date(item.date);
                date = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
            } else {
                date = "NOW";
            }

            if (total / count > 0) {
                out.push({ date: date, average: Math.round(total / count) });
            }
        }

        return out;
    }

    const THE_COLLECTOR = tooltipCollector();



    return (
        <ResponsiveContainer width={"100%"} height={400}>
            <LineChart
                width={500}
                height={300}
                data={calculateDailyAverageDownloadCount()}
            >
                <CartesianGrid strokeDasharray={"3 3"} />
                <XAxis dataKey={"date"} />
                <YAxis tick={<CustomizedTick THE_COLLECTOR={THE_COLLECTOR} />} allowDecimals={false} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip THE_COLLECTOR={THE_COLLECTOR} />} />
                <Line type="monotone" dataKey={"average"} stroke={"#1BD96A"} name={label} />
            </LineChart>
        </ResponsiveContainer>
    )
}

export default AverageGrowthChart

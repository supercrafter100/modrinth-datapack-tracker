import React from 'react'

const CustomTooltip = ({ active, payload, label, coordinate, THE_COLLECTOR }: { active?: boolean, payload?: any, label?: any, coordinate?: any, THE_COLLECTOR: any }) => {

    if (payload === null) return null;

    if (active) {
        const { min, max } = THE_COLLECTOR.maxAndMin();
        const threshold = min.value / 20;
        const deltaY = max.y - min.y;
        const deltaValue = max.value - min.value;
        const cursorValue = min.value - deltaValue * ((min.y - coordinate.y) / deltaY);
        const points = payload.map((p: any) => {
            const { color, stroke, dataKey, fill, name, payload } = p;
            return {
                color,
                stroke,
                dataKey,
                fill,
                name: name,
                value: payload[dataKey],
            };
        });

        const nearestPointIndexes = points.reduce((acc: any, curr: any, index: number) => {
            const deltaValue = Math.abs(curr.value - cursorValue);
            if (acc.length === 0) return (deltaValue < threshold) ? [{ index, deltaValue }] : [];
            if (Math.abs(deltaValue - acc[0].deltaValue) < threshold) return acc.concat([{ index, deltaValue }]);
            return acc;
        }, []);

        if (nearestPointIndexes.length === 0) return null;
        const nearestPoints = nearestPointIndexes
            .map(({ index }: { index: number }) => points[index]);

        return (
            <div className="bg-gray-700 p-3 rounded-lg">
                <p>{label}</p>
                {nearestPoints.map((nearestPoint: any, index: number) =>
                    <div key={`nearestPoint_${index}`} >
                        <p>
                            {`${nearestPoint.name}: ${nearestPoint.value}`}
                        </p>
                    </div>
                )}
            </div>
        )
    }
    return null;
}

export default CustomTooltip
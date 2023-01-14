export default function tooltipCollector() {
    const _collection: any[] = [];
    let _min = { y: 0, value: 0 };
    let _max = { y: 1, value: 1 };
    function _setMaxAndMin() {
        const ys = _collection.map(obj => obj.y);
        const maxY = Math.max(...ys);
        const maxYIndex = ys.indexOf(maxY);
        _max = _collection[maxYIndex];
        const minY = Math.min(...ys);
        const minYIndex = ys.indexOf(minY);
        _min = _collection[minYIndex];
    }

    return {
        collect: (value: any, y: number) => {
            _collection.push({ value, y });
            _setMaxAndMin();
        },
        maxAndMin: () => {
            return {
                max: { ..._max },
                min: { ..._min },
            };
        },
    };
}
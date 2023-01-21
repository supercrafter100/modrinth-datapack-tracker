import React, { useState, useEffect, useRef } from 'react'
import { Collapse } from 'react-collapse';

const MultiSelect = ({ options, standard, selected, setSelected }: { options: { name: string, value: string }[]; standard: string, selected: { name: string, value: string }[]; setSelected: Function }) => {

    const [dropdown, setDropdown] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event: any) {
            if (wrapperRef.current && !(wrapperRef.current as any).contains(event.target)) {
                setDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [wrapperRef]);

    const toggleItem = (val: { name: string; value: string }) => {
        if (selected.find(c => c.value === val.value)) {
            removeItem(val.value);
        } else {
            addItem(val);
        }
    };

    const addItem = (val: { name: string; value: string }) => {
        setSelected([
            ...selected,
            val
        ]);
    }
    const removeItem = (val: string) => {
        setSelected(selected.filter((v) => v.value !== val));
    }

    useEffect(() => {
        const i = options.find(c => c.value === standard);
        if (i) {
            setSelected([i]);
        }
    }, []);

    return (
        <div ref={wrapperRef} className={"w-full flex flex-col bg-[#434956] rounded-xl items-center mx-auto z-10 relative " + (dropdown ? "rounded-b-none" : "")} onClick={() => { if (!dropdown) setDropdown(!dropdown) }}>
            <div className="w-full">
                <div className="flex flex-col items-center relative">
                    <div className="p-1 flex rounded w-full h-full">
                        <div className="flex flex-auto flex-wrap">
                            {selected.map((item, idx) =>
                                <div key={idx} className="flex justify-center items-center m-1 font-medium py-1 px-2 rounded-full text-white bg-transparent border-2 border-green-400">
                                    <div className="text-xs font-normal leading-none max-w-full flex-initial">{item.name}</div>
                                    <div className="flex flex-auto flex-row-reverse">
                                        <div onClick={() => removeItem(item.value)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x cursor-pointer hover:text-teal-400 rounded-full w-4 h-4 ml-2">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {selected.length === 0 && <div className="flex items-center text-[#838B97] ml-5">Select projects to list</div>}
                        </div>
                        <div className="text-gray-300 w-8 py-1 pl-2 pr-1 flex items-center border-gray-200 z-10" onClick={() => setDropdown(!dropdown)}>
                            <button className="cursor-pointer w-6 h-6 text-[#999999] outline-none focus:outline-none">
                                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={"duration-300 w-4 h-4" + (dropdown ? " rotate-180" : "rotate-0")}>
                                    <polyline points="18 15 12 9 6 15"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <Collapse isOpened={dropdown}>
                    <div className="shadow top-[100%] bg-[#434956] z-40 w-full left-0 rounded-b-xl max-h-[300px] overflow-y-auto">
                        <div className="flex flex-col w-full">
                            {options.map((item, idx) =>
                                <div key={idx} className={"cursor-pointer w-full " + (selected.some(f => f.value === item.value) ? "bg-[#1bd96a] text-black font-bold" : "hover:bg-[#616570] text-[#A3BABC] hover:text-white")} onClick={() => toggleItem(item)}>
                                    <div className="flex w-full items-center p-2 pl-2 border-transparent relative">
                                        <div className="w-full items-center flex">
                                            <div className="mx-2 leading-6 text-inherit">{item.name}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Collapse>
            </div>
        </div>
    )
}

export default MultiSelect
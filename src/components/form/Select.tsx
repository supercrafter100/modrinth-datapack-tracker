import React, { useState, useEffect } from 'react'
import { Collapse } from 'react-collapse';

const Select = ({ options, standard, selected, setSelected }: { options: { name: string, value: string }[]; standard: string, selected: { name: string, value: string } | undefined; setSelected: Function }) => {

    const [dropdown, setDropdown] = useState(false);

    useEffect(() => {
        const i = options.find(c => c.value === standard);
        if (i) {
            setSelected([i]);
        }
    }, []);

    return (
        <div className={"w-full flex flex-col bg-[#434956] rounded-xl items-center mx-auto z-10 relative " + (dropdown ? "rounded-b-none" : "")} onClick={() => { if (!dropdown) setDropdown(!dropdown) }}>
            <div className="w-full">
                <div className="flex flex-col items-center relative">
                    <div className="p-1 flex rounded w-full h-full">
                        <div className="flex flex-auto flex-wrap">
                            {selected && <div className="flex items-center text-inputtext ml-5">{selected.name}</div>}
                            {!selected && <div className="flex items-center text-[#838B97] ml-5">Select projects to list</div>}
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
                                <div key={idx} className={"cursor-pointer w-full " + (selected?.value === item.value ? "bg-[#1bd96a] text-black font-bold" : "hover:bg-[#616570] text-[#A3BABC] hover:text-white")} onClick={() => setSelected(item)}>
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

export default Select
import React from 'react'

const Toggle = ({ text, toggled, setToggled }: { text: string, toggled: boolean, setToggled: Function }) => {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" checked={toggled} onClick={() => setToggled(!toggled)} />
            <div className="w-11 h-6 bg-[#434956] rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{text}</span>
        </label>
    )
}

export default Toggle
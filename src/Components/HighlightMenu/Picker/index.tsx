import React, { useState, useEffect, useRef, MouseEvent } from 'react'
import { useAnnoteArea } from "../../../Context/context"
import style from './picker.module.scss'

// color picker of any color 
const Picker = () => {
    const { setHighlightColor } = useAnnoteArea(); 
    const [ selectedColor, setSelectedColor ] = useState('#ff0000');
    const handlePickerSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target) return;

        setSelectedColor(event.target.value);
        setHighlightColor(event.target.value);
    }

    return (
        <div>
            <input
                type="color"
                value={selectedColor}
                onChange={handlePickerSelection}
            />
            <div 
                style={{
                    backgroundColor: selectedColor,
                }}
                className={style['picker']}
            ></div>
        </div>
    )
}

export default Picker
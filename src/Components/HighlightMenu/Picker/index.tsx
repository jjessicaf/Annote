import React, { useState, useEffect, useRef, MouseEvent } from 'react'
import { useAnnoteArea } from "../../../Context/context"
import style from './picker.module.scss'

// color picker of any color 
const Picker = () => {
    const { highlightColor, setHighlightColor } = useAnnoteArea(); 
    const [ selectedColor, setSelectedColor ] = useState('#ff0000');
    const originalColor = useRef('#ff0000');

    useEffect(() => {
        setHighlightColor(selectedColor);
    }, [selectedColor]);

    const handlePickerSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target) return;
        console.log("Hc " + highlightColor);
        console.log("what is " + event.target.value);
        setSelectedColor(event.target.value);
        originalColor.current = event.target.value;
    }

    const pickerDown = () => {
        const red = parseInt(originalColor.current.slice(1, 3), 16);
        const green = parseInt(originalColor.current.slice(3, 5), 16);
        const blue = parseInt(originalColor.current.slice(5, 7), 16);

        const darkRed = Math.min(Math.max(0, red - 55), 255);
        const darkGreen = Math.min(Math.max(0, green - 55), 255);
        const darkBlue = Math.min(Math.max(0, blue - 55), 255);
      
        const darkerColor = `#${darkRed.toString(16).padStart(2, "0")}${darkGreen.toString(16).padStart(2, "0")}${darkBlue.toString(16).padStart(2, "0")}`;

        setSelectedColor(darkerColor);
    }

    const pickerUp = () => {
        setSelectedColor(originalColor.current);
    }

    return (
        <button
            style={{
                backgroundColor: selectedColor,
            }}
            className={style['picker']}
            value={selectedColor}
            onMouseDown={pickerDown}
            onMouseUp={pickerUp}
        >
            <input
                type="color"
                value={selectedColor}
                onChange={handlePickerSelection}
            />
        </button>
    )
}

export default Picker
import React, { useState, useEffect, useRef, MouseEvent, FC } from 'react'
import scss from "./highlightmenu.module.scss"
import { useAnnoteArea } from '../../Context/context';
import Picker from './Picker';


interface HighlightMenuProps {
    x: number;
    y: number;
    displayMenu: boolean;
}

// default color options for highlight

const colors = ['pink', 'yellow', 'blue'];

const HighlightMenu: FC<HighlightMenuProps> = ({ x, y, displayMenu }) => {
    const { setHighlightColor } = useAnnoteArea(); 
    const handleSelection = (event : MouseEvent<HTMLButtonElement>) => {
        if (!event.target) return;
        setHighlightColor(event.currentTarget.value);
        
        console.log("highlight color set to " + event.currentTarget.value);
    }  
    
    return (
        <div 
            className= {`${displayMenu ? scss.highlightMenu : scss.hidden}`}
            style={{top: `${y}px`, left: `${x}px`}}
        >
            {colors.map((c) => (
                <button className={scss['colorsButton'] + ' ' + scss[c]}
                    key={c}
                    value={c}
                    onClick={handleSelection}
                />
                ))
            }
        </div>
    )
}

export default HighlightMenu


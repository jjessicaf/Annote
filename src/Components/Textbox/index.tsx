import React, { useState, useEffect, useRef, FC } from 'react';
import scss from './textbox.module.scss';

interface TextAreaProps {
    x: number;
    y: number;
    i: number;
    setActiveObj: (value: React.RefObject<any>) => void; // Callback prop
}

const TextArea: FC<TextAreaProps> = ({ x, y, i, setActiveObj }) => {
    const textClass = 'textbox';
    const [minimized, setMinimized] = useState(false);
    const localActiveObj = useRef(true);
    const [lastSavedValue, setLastSavedValue] = useState('');
    const [textValue, setTextValue] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextValue(event.target.value);
    }
    
    useEffect(() => {
        const handleDeselect = (event : MouseEvent) => {
            if (textboxRef.current && !textboxRef.current.contains(event.target as HTMLElement)) {
                setLastSavedValue(textValue); // save the current text
                setMinimized(true);
            }
        }
        document.addEventListener('click', handleDeselect);
        
        return () => {
            document.removeEventListener('click', handleDeselect);
        }
    }, []);

    const textboxRef = useRef<HTMLTextAreaElement>(null);

    return (
        <textarea
            ref={textboxRef}
            key={i}
            value={minimized ? lastSavedValue : textValue}
            onChange={handleChange}
            id={`note-${i}`}
            style={{top: `${y}px`, left: `${x}px`}}
            className= {`${scss.textbox} ${minimized ? scss.minimized : ''}`}
            onClick={(event) => {
                event.stopPropagation(); // prevents event from bubbling up to window and triggering window click
                console.log("Element clicked! " + textboxRef.current);
                setActiveObj(localActiveObj);
                setMinimized(false);
            }}
        />
    );
};

export default TextArea

import React, { useState, useEffect, useRef, ReactElement, FC } from 'react';

/*
    useRef: provides a way to access and store a value across multiple 
        renders without causing a re-render of the component.
    
*/
import { useAnnoteArea } from '../../Context/context'

import scss from './annotearea.module.scss'
import { text } from 'stream/consumers';
import TextArea from 'Components/Textbox';

// container of all the edits

// app
const uniqueId = 'on-page-annotator';
const app = document.getElementById(uniqueId);

const wrapperClass = 'wrapper';
const highlightClass = 'highlight';
const textClass = 'textbox';

function AnnoteArea() {

    const {highlightColor, isHidden, textOn, highlightOn} = useAnnoteArea();

    const [textAreas, setTextAreas] = useState<ReactElement[]>([]);

    const dragging = useRef(false);
    const activeObj = useRef(false);
    const setActiveObj = (value: React.RefObject<any>) => {
        activeObj.current = value.current;
    };    
    const i = useRef(0); // index of text area

    useEffect(() => {
        console.log("useEffect from content!")
        window.addEventListener('click', handleClick);
        window.addEventListener('mouseup', handleSelection);
        return () => { // when component is unmounted 
            window.removeEventListener('click', handleClick);
            window.removeEventListener('mouseup', handleSelection);
        }
    }, [])

    useEffect(() => {
        if (isHidden) {
            hideAll()
        }
    }, [isHidden])

    const handleClick = (event: MouseEvent) => {
        if (event.button != 0) return; // not a left-click

        console.log(activeObj.current);

        if (dragging.current) {
            dragging.current = false; 
        }
        else if (!(event.target as HTMLElement).closest("textarea") && activeObj.current) {
            activeObj.current = false;
        } else if (!dragging.current && !activeObj.current && textOn) {
            // create text area 
            console.log("create text: " + event.clientX + " " + event.clientY);
            newTextArea(event.pageX, event.pageY, i.current); // location and index
            i.current++;
        }
    }

    const newTextArea = (x: number, y: number, i: number) => {
        activeObj.current = true;
        const newTextAreaElement = (
            <TextArea x={x} y={y} i={i} setActiveObj={setActiveObj} />
        );
        setTextAreas((prevTextAreas) => [...prevTextAreas, newTextAreaElement]);
    };

    const handleSelection = () => {
        const selection = window.getSelection();
        if (highlightOn && selection) {
            const selectedText = selection.toString().trim();
            console.log(selectedText);
            if (selectedText.length > 0) {
                
                // bring up highlightMenu
                // then set based on color selection
                // should await? 

                /*
                dragging.current = true;
                activeObj.current = true;
                const range = selection.getRangeAt(0);
                const newNode = document.createElement("span");
                newNode.classList.add(highlightClass);
                newNode.style.backgroundColor = highlightColor;
                newNode.appendChild(range.extractContents());
                range.insertNode(newNode);
                */
            }
        }
    }

    const hideAll = () => {
        dragging.current = false; 
        activeObj.current = false;

        const wrapper = app?.querySelector(wrapperClass);
        if (wrapper) {
            wrapper.classList.add('hidden'); // hide
        }
      
        const highlights: NodeListOf<Element> = document.querySelectorAll("span." + highlightClass);
        highlights.forEach(function (h: Element) {
          let temp: HTMLElement = document.createElement(h.tagName);
          while (h.firstChild) {
            temp.appendChild(h.firstChild);
          }
          if (h.parentNode) {
            h.parentNode.replaceChild(temp, h);
          }
        });
    }

    return (
        <div className={scss[wrapperClass]}>
            {textAreas.map((textAreaElement, index) => (
                <React.Fragment key={index}>{textAreaElement}</React.Fragment>
            ))}
        </div>
    )
}

export default AnnoteArea

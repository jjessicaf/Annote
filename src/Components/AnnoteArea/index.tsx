import React, { useState, useEffect, useRef, ReactElement, FC } from 'react';

/*
    useRef: provides a way to access and store a value across multiple 
        renders without causing a re-render of the component.
    
*/
import { useAnnoteArea } from '../../Context/context'

import scss from './annotearea.module.scss'
import { text } from 'stream/consumers';
import TextArea from 'Components/Textbox';
import HighlightMenu from 'Components/HighlightMenu';
import { start } from 'repl';

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

    const [toDisplay, setToDisplay] = useState(false); 
    const [displayX, setDisplayX] = useState(0);
    const [displayY, setDisplayY] = useState(0);
    
    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const lastTextSelection = useRef("");
    const maxX = useRef(0);
    const minX = useRef(document.documentElement.clientWidth + 1);

    const handleMouseMove = (event: MouseEvent) => {
        const { pageX, pageY } = event;
        mouseX.current = pageX;
        mouseY.current = pageY;
    };

    const dragging = useRef(false);
    const [isDragging, setIsDragging] = useState(false);
    const activeObj = useRef(false);
    const setActiveObj = (value: React.RefObject<any>) => {
        activeObj.current = value.current;
    };    
    const i = useRef(0); // index of text area

    useEffect(() => {
        console.log("useEffect from content!")
        window.addEventListener('click', handleClick);
        document.addEventListener('mouseup', handleSelection);
        window.addEventListener('mousedown', handleMouseMove);
        return () => { // when component is unmounted 
            window.removeEventListener('click', handleClick);
            document.removeEventListener('mouseup', handleSelection);
            window.removeEventListener('mousedown', handleMouseMove);
        }
    }, [])

    useEffect(() => {
        if (isHidden) {
            hideAll()
        }
    }, [isHidden])

    useEffect(() => { // listen to dragging
        const handleMouseDown = (event: MouseEvent) => {
            setIsDragging(true);
            maxX.current = Math.max(maxX.current, event.pageX);
            minX.current = Math.min(minX.current, event.pageX);
        };
    
        const handleMouseMove = (event: MouseEvent) => {
          if (isDragging) {
            maxX.current = Math.max(maxX.current, event.pageX);
            minX.current = Math.min(minX.current, event.pageX);
          }
        };
    
        const handleMouseUp = () => {
            setIsDragging(false);
            minX.current = document.documentElement.clientWidth + 1;
            maxX.current = 0;
        };
    
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    
        return () => {
          document.removeEventListener('mousedown', handleMouseDown);
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    const handleClick = (event: MouseEvent) => {
        if (event.button != 0) return; // not a left-click
        // check if link is being clicked

        if (dragging.current) { // is highlighting 
            dragging.current = false; 
        }
        else if (!(event.target as HTMLElement).closest("textarea") && activeObj.current) { // not clicking
            activeObj.current = false;
            lastTextSelection.current = "";
            handleSelection(event);
            setToDisplay(false);
        } else if (!dragging.current && !activeObj.current && textOn) { // create text area 
            lastTextSelection.current = "";
            handleSelection(event);
            setToDisplay(false);
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

    const handleSelection = (event: Event) => {
        event.stopPropagation();
        const selection = document.getSelection();
        if (highlightOn && selection) {
            const selectedText = selection.toString().trim();
            console.log("selected text: " + selectedText + ", last: " + lastTextSelection.current);
            if (selectedText.length >= 1) {
                dragging.current = true;
                activeObj.current = true;
                if (selectedText != lastTextSelection.current) {
                    var xPos = mouseX.current;
                    var yPos = mouseY.current; // to-do: make it dyanmic
                    
                    const range = selection.getRangeAt(0);
                    const startNode = range.startContainer;
                    
                    if (startNode) {
                        const boxTop = startNode.parentElement? startNode.parentElement.getBoundingClientRect().top : 0;
                        const boxBot = startNode.parentElement? startNode.parentElement.getBoundingClientRect().bottom : 0;
                        yPos = (document.documentElement.scrollTop + boxTop) - 50; // 50 is height of menu
                        xPos = minX.current + (maxX.current-minX.current)/2 - 100; // 100 is half of width of menu
                        if (boxBot-boxTop < 30) yPos -= 120/(boxBot-boxTop);
                    }
                    else yPos -= 70;
                   
                    setDisplayX(xPos);
                    setDisplayY(yPos);
                    setToDisplay(true);
                }
                lastTextSelection.current = selectedText;

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
            else {
                setToDisplay(false);
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
            <HighlightMenu x={displayX} y={displayY} displayMenu={toDisplay} />
            {textAreas.map((textAreaElement, index) => (
                <React.Fragment key={index}>{textAreaElement}</React.Fragment>
            ))}
        </div>
    )
}

export default AnnoteArea

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

    const [textAreas, setTextAreas] = useState<ReactElement[]>([]);
    const i = useRef(0); // index of text area

    const [highlightNodes, setHighlightNodes] = useState({});
    const highlightIndex = useRef(0);
    const lastColor = useRef('#ffe159');

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

    useEffect(() => {
        console.log("Annotearea: " + highlightColor);
        handleSelection();
    }, [highlightColor]);

    const handleClick = (event: MouseEvent) => {
        if (event.button != 0) return; // not a left-click
        // check if link is being clicked

        if (dragging.current) { // is highlighting 
            dragging.current = false; 
        }
        else if (!(event.target as HTMLElement).closest("textarea") && activeObj.current) { // not clicking
            activeObj.current = false;
            lastTextSelection.current = "";
            handleSelection();
            setToDisplay(false);
        } else if (!dragging.current && !activeObj.current && textOn) { // create text area 
            lastTextSelection.current = "";
            handleSelection();
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

    const handleSelection = () => {
        // Helper function to get the outerHTML of an element
        const getOuterHTML = (element: Node) => {
            const tempElement = document.createElement('div');
            tempElement.appendChild(element.cloneNode(true));
            return tempElement.innerHTML;
        };

        const getInnerText = (element: Node) => {
            const tempElement = document.createElement('div');
            tempElement.appendChild(element.cloneNode(true));
            return tempElement.innerText;
        }

        const positionMenu = (range: Range) => {
            var xPos = mouseX.current;
            var yPos = mouseY.current; 

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

        const getNextNode = (node: Node) => {
            if (node.firstChild)
                return node.firstChild;
            while (node)
            {
                if (node.nextSibling)
                    return node.nextSibling;
                node = node.parentNode!;
            }
        }

        const setHighlight = (range: Range) => { 
            
            // Get the common ancestor container and iterate through child nodes
            const ancestor = range.commonAncestorContainer;
            let startNode: Node = range.startContainer;
            let endNode: Node = range.endContainer;
            let nodes = [];
            let currentNode: Node; 
            
            for (currentNode = startNode.parentNode!; currentNode; currentNode = getNextNode(currentNode)!) {
                nodes.push(currentNode);
                if (currentNode == endNode) break; 
            }

            nodes.forEach(node => {
                console.log("node: " + getOuterHTML(currentNode));
                if (range.intersectsNode(currentNode)) {
                    
                    if (currentNode.nodeType === Node.TEXT_NODE) {
                        const startOffset = (currentNode === range.startContainer) ? range.startOffset : 0;
                        const endOffset = (currentNode === range.endContainer) ? range.endOffset : currentNode.nodeValue?.length;

                        if (startOffset < endOffset!) {
                            console.log("meow text node");
                            // Wrap the selected part of the text with the new span element

                            const selectedText = currentNode.nodeValue?.substring(startOffset, endOffset);
                            const replacementText = `<span class="${highlightClass}" style="background-color:${highlightColor};">${selectedText}</span>`;
                            const newHTML = currentNode.nodeValue?.replace(selectedText!, replacementText);

                            // Create a new element to hold the replacement HTML
                            const newElement = document.createElement("span");
                            newElement.innerHTML = newHTML || ""; // Use empty string if newHTML is undefined

                            // Replace the current text node with the new element
                            currentNode.parentNode?.replaceChild(newElement, currentNode);
                            //const selectedNode = document.createTextNode(selectedText!);
                            //newNode.appendChild(selectedNode);
                        }
                    }
                    else { // TO-DO: doesn't work past first node
                        const elementNode = currentNode as HTMLElement; // Type assertion

                        const clonedRange = range.cloneRange();
                        clonedRange.selectNodeContents(currentNode);

                        // Calculate offsets
                        const startOffset = (currentNode === range.startContainer) ? range.startOffset : 0;
                        const endOffset = (currentNode === range.endContainer) ? range.endOffset : elementNode.textContent?.length;


                        const textBefore = clonedRange.toString().substring(0, startOffset);
                        const textAfter = clonedRange.toString().substring(endOffset!);

                        const replacementText = `<span class="${highlightClass}">` + clonedRange.toString().substring(startOffset, endOffset) + "<\\span>";

                        const newHTML = `${textBefore}${replacementText}${textAfter}`;
                        elementNode.innerHTML = newHTML;
                        console.log("eh " + elementNode.innerHTML);
                    }
                        /* else if */
                    //if (currentNode.nodeType === Node.ELEMENT_NODE) {
                        //if (range.intersectsNode(currentNode)) {
                            // Wrap the entire element node with the new span element
                    
                        //const clonedNode = currentNode.cloneNode(true);
                        //newNode.appendChild(clonedNode);
                       //}
                    //}
                
                }
            });
            /*
            while (currentNode && currentNode !== range.endContainer.nextSibling) {
                console.log("node: " + getOuterHTML(currentNode));
                if (range.intersectsNode(currentNode)) {
                    
                    if (currentNode.nodeType === Node.TEXT_NODE) {
                        const startOffset = (currentNode === range.startContainer) ? range.startOffset : 0;
                        const endOffset = (currentNode === range.endContainer) ? range.endOffset : currentNode.nodeValue?.length;

                        if (startOffset < endOffset!) {
                            console.log("meow text node");
                            // Wrap the selected part of the text with the new span element

                            const selectedText = currentNode.nodeValue?.substring(startOffset, endOffset);
                            const replacementText = `<span class="${highlightClass}" style="background-color:${highlightColor};">${selectedText}</span>`;
                            const newHTML = currentNode.nodeValue?.replace(selectedText!, replacementText);

                            // Create a new element to hold the replacement HTML
                            const newElement = document.createElement("span");
                            newElement.innerHTML = newHTML || ""; // Use empty string if newHTML is undefined

                            // Replace the current text node with the new element
                            currentNode.parentNode?.replaceChild(newElement, currentNode);
                            //const selectedNode = document.createTextNode(selectedText!);
                            //newNode.appendChild(selectedNode);
                        }
                    }
                    else { // TO-DO: doesn't work past first node
                        const elementNode = currentNode as HTMLElement; // Type assertion

                        const clonedRange = range.cloneRange();
                        clonedRange.selectNodeContents(currentNode);

                        // Calculate offsets
                        const startOffset = (currentNode === range.startContainer) ? range.startOffset : 0;
                        const endOffset = (currentNode === range.endContainer) ? range.endOffset : elementNode.textContent?.length;


                        const textBefore = clonedRange.toString().substring(0, startOffset);
                        const textAfter = clonedRange.toString().substring(endOffset!);

                        const replacementText = `<span class="${highlightClass}">` + clonedRange.toString().substring(startOffset, endOffset) + "<\\span>";

                        const newHTML = `${textBefore}${replacementText}${textAfter}`;
                        elementNode.innerHTML = newHTML;
                        console.log("eh " + elementNode.innerHTML);
                    }
                        /* else if */
                    //if (currentNode.nodeType === Node.ELEMENT_NODE) {
                        //if (range.intersectsNode(currentNode)) {
                            // Wrap the entire element node with the new span element
                    
                        //const clonedNode = currentNode.cloneNode(true);
                        //newNode.appendChild(clonedNode);
                       //}
                    //}
                /*
                }

                currentNode = currentNode.nextSibling!;
            }*/

            // Replace the selected nodes with the new span element
            //range.deleteContents();
            //range.insertNode(newNode);
        }

        const updateHighlight = (range: Range) => { 
            console.log("changing color!");
        }

        const selection = document.getSelection();
        if (highlightOn && selection) {
            const selectedText = selection.toString().trim();
            console.log("selected text: " + selectedText + ", last: " + lastTextSelection.current);
            if (selectedText.length >= 1) {
                dragging.current = true;
                activeObj.current = true;
                const range = selection.getRangeAt(0);
                if (selectedText != lastTextSelection.current) {
                    console.log("hi");
                    positionMenu(range);
                    setHighlight(range);

                    setHighlightNodes((prevHighlightNodes) => ({...prevHighlightNodes, [`highlight-${highlightIndex.current}`]: selectedText}));
                    lastColor.current = highlightColor;
                }
                if (highlightColor != lastColor.current) {
                    updateHighlight(range);
                    /* // TO-DO: iterate through all nodes that intersect the range
                        // identify highlight nodes in the range
                        // for each node, put the part of the text that it contains in a span
                        // if there is an existing span, combine the spans 
                    */
                    
                        
                    /*
                    // Traverse the DOM tree within the range
                    const treeWalker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_ELEMENT);
    
                    let currentNode: Node = range.startContainer!;
                    while (currentNode && currentNode !== range.endContainer.nextSibling) {
                        console.log("Outer: " + getOuterHTML(currentNode));
                        if (range.intersectsNode(currentNode)) {
                            if (getOuterHTML(currentNode).includes(`class=${highlightClass}`)) {
                                //console.log(getOuterHTML(currentNode));
                                // get the id
                                // replace the node with the text
                                // delete from dictionary
                                //currentNode.parentNode?.removeChild(currentNode);
                            }
                            // see what part of the current node is from the selection
                            //console.log("inner: " + getInnerText(currentNode));

                            // create span 
                                
                        }
                        currentNode = treeWalker.nextNode()!;
                        
                    }
                    const newNode = document.createElement("span");
                    newNode.classList.add(highlightClass);
                    newNode.id = `highlight-${highlightIndex.current}`;
                    highlightIndex.current++;
                    newNode.style.backgroundColor = highlightColor;
                    newNode.appendChild(range.extractContents());
                    range.insertNode(newNode);
                    setHighlightNodes((prevHighlightNodes) => ({...prevHighlightNodes, [`highlight-${highlightIndex.current}`]: selectedText}));    */
                }
                lastTextSelection.current = selectedText;

                /*
                
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

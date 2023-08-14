import React, {
    createContext,
    Dispatch,
    FC,
    SetStateAction,
    useContext,
    useState,
} from 'react';
  
/*
provider is a component that allows data to be passed down the component 
tree without the need to pass props explicitly at each level. It enables 
a feature called "context," which provides a way to share data across multiple 
components without the need for prop drilling
*/

type AnnoteAreaContext = {
    highlightColor: string;
    setHighlightColor: Dispatch<SetStateAction<string>>;
    isHidden: boolean;
    setHiddenState: Dispatch<SetStateAction<boolean>>;
    textOn: boolean;
    setTextState: Dispatch<SetStateAction<boolean>>;
    highlightOn: boolean;
    setHighlightState: Dispatch<SetStateAction<boolean>>; 
}
  
// contain all state values such as highlight color, etc
const AnnoteArea = createContext<AnnoteAreaContext | undefined>(undefined)

export const AnnoteAreaProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    const [highlightColor, setHighlightColor] = useState('#ffe159'); // yellow
    const [isHidden, setHiddenState] = useState(false); // can be seen 
    const [textOn, setTextState] = useState(true); // can't edit text 
    const [highlightOn, setHighlightState] = useState(true); // can't highlight

    return (
      <AnnoteArea.Provider
        value={{
          highlightColor,
          setHighlightColor,
          isHidden,
          setHiddenState,
          textOn,
          setTextState,
          highlightOn,
          setHighlightState,
        }}
      >
        {children}
      </AnnoteArea.Provider>
    );
};
  
export const useAnnoteArea = (): AnnoteAreaContext => {
    const context = useContext(AnnoteArea);
  
    if (context === undefined) {
      throw new Error('No AnnoteArea found!');
    }
  
    return context;
}
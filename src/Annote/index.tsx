import { AnnoteAreaProvider } from '../Context/context';
import AnnoteArea from "../Components/AnnoteArea";

// rendered within wrapper
const Annote = () => (
    <AnnoteAreaProvider>
         <main>
             <AnnoteArea />
         </main>
     </AnnoteAreaProvider>
)
 
export default Annote;

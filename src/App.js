import { Questions } from './components/sections/Questions';
import './components/styles/App.css'

function App() {

    return (
        <div className='App'>
            <h1 className="title">Input your data below</h1>
            <span className="divider"></span>
            <Questions/>
        </div>
    );
}

export default App;

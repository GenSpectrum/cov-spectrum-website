import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import './App.css';
import { MainPage } from "./MainPage";
import { Header } from "./Header";


function App() {
  return (
    <div className="App">
      <Header />
      <MainPage/>
    </div>
  );
}


export default App;

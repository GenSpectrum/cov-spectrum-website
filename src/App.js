import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import './App.css';
import { MainPage } from "./MainPage";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Route } from "react-router-dom";
import { SamplePage } from "./SamplePage";


function App() {
  return (
    <div className="App">
      <Header />
      <Route path="/variant">
        <MainPage/>
      </Route>
      <Route path="/sample">
        <SamplePage />
      </Route>
      <Footer/>
    </div>
  );
}


export default App;

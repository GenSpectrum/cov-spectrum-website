import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import './App.css';
import { MainPage } from "./pages/MainPage";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Route, Switch, Redirect } from "react-router-dom";
import { SamplePage } from "./pages/SamplePage";


function App() {
  return (
    <div className="App">
      <Header />
      <Switch>
        <Route exact path="/"><Redirect to="/variant" /></Route>
        <Route path="/variant"><MainPage/></Route>
        <Route path="/sample"><SamplePage /></Route>
      </Switch>
      <Footer/>
    </div>
  );
}


export default App;

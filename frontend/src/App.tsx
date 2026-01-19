import { BrowserRouter, Routes, Route } from "react-router-dom";

// Views
import SignUp from "./views/SignUp";
import EmailVerification from "./views/EmailVerification";
import CompleteSignup from "./views/CompleteSignup";
import Login from "./views/Login";
import Home from "./views/Home";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" Component={Home}/>
        <Route path="/signup" Component={SignUp} />
        <Route path="/email-verification" Component={EmailVerification}/>
        <Route path="/complete-signup" Component={CompleteSignup}/>
        <Route path="/login" Component={Login}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

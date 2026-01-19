import { BrowserRouter, Routes, Route } from "react-router-dom";

// Views
import SignUp from "./views/SignUp";
import EmailVerification from "./views/EmailVerification";
import CompleteSignup from "./views/CompleteSignup";
import Login from "./views/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" Component={SignUp} />
        <Route path="/email-verification" Component={EmailVerification}/>
        <Route path="/complete-signup" Component={CompleteSignup}/>
        <Route path="/login" Component={Login}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";

// Views
import SignUp from "./views/SignUp";
import EmailVerification from "./views/EmailVerification";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" Component={SignUp} />
        <Route path="/email-verification" Component={EmailVerification}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

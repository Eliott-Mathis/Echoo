import { BrowserRouter, Routes, Route } from "react-router-dom";

// Views
import SignUp from "./views/SignUp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" Component={SignUp} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

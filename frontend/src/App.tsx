import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Views
import SignUp from "./views/SignUp";
import EmailVerification from "./views/EmailVerification";
import CompleteSignup from "./views/CompleteSignup";
import Login from "./views/Login";
import Home from "./views/Home";
import FriendsTab from "./views/home/FriendsTab";
import DirectMessageTab from "./views/home/DirectMessageTab";
import DynamiteTab from "./views/home/DynamiteTab";
import SettingsPopup from "./views/home/SettingsPopup";
import ProtectedRoute from "./routes/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/friends/addfriend" replace />} />
        <Route path="/home" element={<Navigate to="/friends/addfriend" replace />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Home />}>
            <Route path="/friends" element={<Navigate to="/friends/addfriend" replace />} />
            <Route path="/friends/:friendTab" element={<FriendsTab />} />
            <Route path="/messages" element={<DirectMessageTab />} />
            <Route path="/messages/:username" element={<DirectMessageTab />} />
            <Route path="/dynamite" element={<DynamiteTab />} />
            <Route path="/settings" element={<SettingsPopup />} />
          </Route>
        </Route>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/complete-signup" element={<CompleteSignup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

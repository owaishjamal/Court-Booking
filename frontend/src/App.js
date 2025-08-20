import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";

import { NoteProvider } from "./context/notes/NoteContext";
import { AlertProvider } from "./context/AlertContext";
import { DataProvider } from "./context/DataContext";

import PageNotFound from "./components/PageNotFound";

import Login from "./components/Login";
import Register from "./components/Register";
import Admin from "./components/Admin";
import AddCentre from "./components/AddCentre";
import AddSport from "./components/AddSport";
import AddCourt from "./components/AddCourt";
import ManagerDashboard from "./components/ManagerDashboard";
import UserDashboard from "./components/UserDashboard";
// index.js
import "bootstrap/dist/css/bootstrap.min.css";
import UserProfile from "./components/UserProfile";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ManageCentres from "./components/ManageCentres";
import LandingPage from "./components/Landing";

function App() {
  return (
    <>
      <DataProvider>
        <NoteProvider>
          <AlertProvider>
            <Routes>
              <Route path="/" index element={<LandingPage />} />
              <Route path="/home" index element={<Home />} />
              <Route path="/register" index element={<Register />} />
              <Route path="/login" index element={<Login />} />
              <Route path="/admin" index element={<Admin />} />
              <Route path="/manager-dashboard" index element={<ManagerDashboard />} />
              <Route path="/user-dashboard" index element={<UserDashboard />} />
              <Route path="/addCentre" index element={<AddCentre />} />
              <Route path="/addSport" index element={<AddSport />} />
              <Route path="/userProfile" index element={<UserProfile />} />
              <Route path="/addCourt" index element={<AddCourt />} />
              <Route path="/forgotPassword" index element={<ForgotPassword />} />
              <Route path="/ManageCentres" index element={<ManageCentres />} />
              <Route path="/resetPassword/:token" element={<ResetPassword />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </AlertProvider>
        </NoteProvider>
      </DataProvider>
    </>
  );
}

export default App;
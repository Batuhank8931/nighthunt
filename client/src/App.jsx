import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import PageDoesNotExist from "./pages/PageDoesNotExist";
import GamerPage from "./pages/GamerPage";

function PrivateRoute({ element }) {
  const token = localStorage.getItem("token");
  return token ? element : <Navigate to="/login" replace />;
}

function App() {
  return (
    <div className="container bg-secondary">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/mainpage" element={<PrivateRoute element={<MainPage />} />} />
        <Route path="/" element={<Navigate to="/mainpage" />} />
        <Route path="/gamerpage/:roomid/:roomname" element={<PrivateRoute element={<GamerPage />} />} />
        {/* Catch-all route for undefined paths */}
        <Route path="*" element={<PageDoesNotExist />} />
      </Routes>
    </div>
  );
}

export default function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}

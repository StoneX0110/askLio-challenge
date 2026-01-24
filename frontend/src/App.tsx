import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import SubmitRequest from "./pages/SubmitRequest";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SubmitRequest />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;

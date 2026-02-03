import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function Home() {
  return <div className="text-3xl font-bold underline">Home</div>;
}

function Login() {
  return <div className="text-3xl font-bold underline">Login</div>;
}

function Tasks() {
  return <div className="text-3xl font-bold underline">Tasks</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

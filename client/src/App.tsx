import { Routes, Route, BrowserRouter } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Coverpage from "./pages/Coverpage";
import MyTask from "./pages/MyTask";
import NewTask from "./pages/NewTask";
import EditTask from "./pages/EditTask";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Coverpage />} />
        <Route path="/mytasks" element={<MyTask />} />
        <Route path="/newtask" element={<NewTask />} />
        <Route path="/edittask/:id" element={<EditTask />} />
        {/* Keep the old edit URL from breaking; users can return to the task list. */}
        <Route path="/edittask" element={<EditTask />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

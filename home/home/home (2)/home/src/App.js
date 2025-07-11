import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Posts from "./pages/Posts";
import AddPostCloud from "./pages/AddPostCloud";
import AskQuestion from "./pages/AskQuestion";
import QnAPage from "./pages/QnAPage";
import AdminProjectTracker from './pages/AdminProjectTracker';
import UserProjectTracker from './pages/UserProjectTracker';

import MainLayout from "./layout/MainLayout";  // import your layout

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Homepage without layout wrapper */}
        <Route path="/" element={<Home />} />

        {/* Other pages without layout wrapper */}
        <Route path="/posts" element={<Posts />} />
        <Route path="/add-post" element={<AddPostCloud />} />
        <Route path="/ask-question" element={<AskQuestion />} />
        <Route path="/qna" element={<QnAPage />} />

        {/* Project Trackers with layout wrapper */}
        <Route
          path="/project-tracker"
          element={
            <MainLayout>
              <UserProjectTracker />
            </MainLayout>
          }
        />
        <Route
          path="/admin-tracker"
          element={
            <MainLayout>
              <AdminProjectTracker />
            </MainLayout>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;

import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Posts from "./pages/Posts";
import AddPostCloud from "./pages/AddPostCloud";
import AskQuestion from "./pages/AskQuestion";
import QnAPage from "./pages/QnAPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/add-post" element={<AddPostCloud />} />
        <Route path="/ask-question" element={<AskQuestion />} />
        <Route path="/qna" element={<QnAPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;

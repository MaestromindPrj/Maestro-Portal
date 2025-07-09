import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import app from "../../firebaseinit_folder/FirebaseAuth";
import {
  collection,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import logo from "../../images/LOGO.jpg";
import ReactPlayer from "react-player/youtube";
import './AdminCoursePage.css';


const db = getFirestore(app);

/* const userRole: string = "Student"; */

interface VideoItem {
  title: string;
  src: string;
  section: string;
  duration?: string;
  thumbnail?: string;
}

export default function AdminMaestroHub() {
  const [openSections, setOpenSections] = useState<{ [key: number]: boolean }>(
    {}
  );

  const toggleSection = (index: number) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(0);
  const [videoList, setVideoList] = useState<VideoItem[]>([]);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const currentVideo = videoList[currentVideoId]?.src || "";





  const { id } = useParams();



  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;

      // Fetch course metadata and videos
      const courseCollection = collection(db, id);
      const snapshot = await getDocs(courseCollection);

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (docSnap.id === "metadata") {
          setCourseInfo(data);

          const sectionData = data.Sections || [];
          const parsedVideos: any[] = [];

          sectionData.forEach((section: any, sectionIndex: number) => {
            const sectionTitle = section.title || `Section ${sectionIndex + 1}`;
            (section.videos || []).forEach((vid: any, vidIndex: number) => {
              parsedVideos.push({
                title: vid.title || `Video ${vidIndex + 1}`,
                section: sectionTitle,
                src: vid.videoUrl || "",
                thumbnail: vid.ThumbnailUrl,
              });
            });
          });

          setVideoList(parsedVideos);
          setCurrentVideoId(0);
        }
      });

      // 🔍 Check enrollment status

    };

    fetchCourseData();
  }, [id]);
  // ✅ re-run whenever course ID changes
  const grouped = videoList.reduce((acc, video) => {
    acc[video.section] = acc[video.section] || [];
    acc[video.section].push(video);
    return acc;
  }, {} as Record<string, VideoItem[]>);



  

  const handleVideoChange = (index: number) => {
    setCurrentVideoId(index);
  };



  return (
    <div className="container">

      {/* Menu Bar */}
      <div className="menu-bar">
        <Link to="/" className="logo-text">
          <img
            src={logo} // Replace with your logo file path
            alt="Maestro Hub Logo"
            className="logo-img"
          />
          <span>MaestroHub</span>
        </Link>

        <div className="hamburger-button">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <div className={`menu-items ${menuOpen ? "open" : ""}`}>
          <Link to="/" state={{ tab: "all" }} className="menu-button">
            All Courses
          </Link>
          <Link to="/" state={{ tab: "enrolled" }} className="menu-button">
            My Courses
          </Link>
        </div>
      </div>

      <div className="main-content">
        <div className="course-area">
          <h2 className="course-title">{courseInfo?.CourseName || "Course"}</h2>
          <div className="course-content">
            <div className="video-player-container">
              <div className="video-player">
                <ReactPlayer
                  url={currentVideo}
                  controls
                  width="100%"
                  height="100%"
                  
                />
              </div>
            </div>

            <div
              className="video-list-section"
              aria-label="Course videos list"
              role="list"
              ref={listRef}
            >
              <div
                className="video-list-heading"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>Course Videos</span>
                
              </div>

              <div className="video-list-content">
                {Object.entries(grouped).map(
                  ([sectionTitle, videos], sectionIndex) => {
                    const isOpen = openSections[sectionIndex] || false;
                    return (
                      <div key={sectionTitle} className="video-section">
                        <button
                          className="video-section-title"
                          onClick={() => toggleSection(sectionIndex)}
                        >
                          {sectionTitle}
                        </button>
                        {isOpen && (
                          <div className="video-sublist">
                            {videos.map((video, idx) => {
                              const globalIndex = videoList.findIndex(
                                (v) => v === video
                              );
                              return (
                                <button
                                  key={`${sectionIndex}-${idx}`}
                                  className={`video-list-item ${
                                    currentVideoId === globalIndex
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() => handleVideoChange(globalIndex)}
                                >
                                  {video.title}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>
        
      </div>

      {/* Course Description & Details */}
      <div className="details-section">
        <div className="card">
          <h2>Course Description</h2>
          <p>
            {courseInfo?.CourseDesc || "A detailed course on React concepts."}
          </p>
        </div>

        <div className="card">
          <h2>Course Details</h2>
          <ul>
            <li>
              <strong>Difficulty:</strong> {courseInfo?.Level}
            </li>
            <li>
              <strong>Duration:</strong> {courseInfo?.Duration}
            </li>
            <li>
              <strong>Instructor:</strong> {courseInfo?.Instructor}
            </li>
            <li>
              <strong>About Instructor:</strong> {courseInfo?.AboutInstructor}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

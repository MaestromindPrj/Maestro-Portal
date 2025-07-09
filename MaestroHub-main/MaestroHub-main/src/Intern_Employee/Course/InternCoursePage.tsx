import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import CustomAlert from "../../utilities/CustomAlert";
import { Link, useParams } from "react-router-dom";
import app from "../../firebaseinit_folder/FirebaseAuth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  updateDoc,
} from "firebase/firestore";
import logo from "../../images/LOGO.jpg";
import ReactPlayer from "react-player/youtube";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import "./InternCoursePage.css";

const db = getFirestore(app);

/* const userRole: string = "Student"; */

interface VideoItem {
  title: string;
  src: string;
  section: string;
  duration?: string;
  thumbnail?: string;
}

export default function InternMaestroHub() {
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
  const [enrollSuccess, setEnrollSuccess] = useState(false); // <-- NEW
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [watchedVideoIds, setWatchedVideoIds] = useState<Set<number>>(
    new Set()
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [width, height] = useWindowSize(); // for fullscreen confetti

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const { id } = useParams();
  const totalVideos = videoList.length;
  const progressPercent = Math.round(
    (watchedVideoIds.size / totalVideos) * 100
  );

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
      const enrollSnap = await getDocs(collection(db, "enrollments"));
      const enrolled = enrollSnap.docs.some(
        (doc) => doc.data().courseId === id
      );
      setIsEnrolled(enrolled);
    };

    fetchCourseData();
  }, [id]);
  // ✅ re-run whenever course ID changes
  const grouped = videoList.reduce((acc, video) => {
    acc[video.section] = acc[video.section] || [];
    acc[video.section].push(video);
    return acc;
  }, {} as Record<string, VideoItem[]>);

  const handleEnroll = async () => {
    if (!id) return;
    try {
      const docRef = await addDoc(collection(db, "enrollments"), {
        courseId: id,
        isEnrolled: true,
        progress: 0,
      });
      console.log("Enrolled successfully:", docRef.id);
      setIsEnrolled(true);
      setEnrollSuccess(true); // <-- trigger message
    } catch (error) {
      console.error("Enrollment failed:", error);
      setAlertMessage(
        "🚫 You need to enroll in the course to watch the videos."
      );
      setAlertVisible(true);
    }
  };

  const markCourseAsCompleted = async () => {
    try {
      const snapshot = await getDocs(collection(db, "enrollments"));
      const match = snapshot.docs.find((doc) => doc.data().courseId === id);
      if (!match) return;

      const enrollmentRef = doc(db, "enrollments", match.id);
      await updateDoc(enrollmentRef, {
        progress: 100,
        isCompleted: true,
      });

      console.log("✅ Course marked as completed");
      setShowConfetti(true); // 🎉 trigger animation
      setTimeout(() => setShowConfetti(false), 8000); // auto-hide after 8s
    } catch (error) {
      console.error("Error marking course as completed:", error);
    }
  };

  const updateProgressInFirestore = async (progress: number) => {
    try {
      const snapshot = await getDocs(collection(db, "enrollments"));
      const match = snapshot.docs.find((doc) => doc.data().courseId === id);
      if (!match) return;

      const enrollmentRef = doc(db, "enrollments", match.id);
      await updateDoc(enrollmentRef, { progress });
      console.log(`Progress updated to ${progress}%`);
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

  const handleVideoChange = (index: number) => {
    if (!isEnrolled) {
      setAlertMessage(
        "🚫 You need to enroll in the course to watch the videos."
      );
      setAlertVisible(true);
      return;
    }
    setCurrentVideoId(index);
  };

  const handleVideoEnd = async (index: number) => {
    if (!id || !isEnrolled) return;

    setWatchedVideoIds((prevSet) => {
      const newSet = new Set(prevSet);
      if (!newSet.has(index)) {
        newSet.add(index);

        const newProgress = Math.round((newSet.size / totalVideos) * 100);
        updateProgressInFirestore(newProgress);

        if (newSet.size === totalVideos) {
          markCourseAsCompleted();
        }
      }
      return newSet;
    });
  };

  return (
    <div className="container">
      {showConfetti && <Confetti width={width} height={height} />}
      {showConfetti && (
        <div
          style={{
            position: "fixed",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            padding: "1rem 2rem",
            borderRadius: "1rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            fontSize: "1.5rem",
            color: "#4CAF50",
            zIndex: 1000,
          }}
        >
          🎉 Congratulations! You completed the course!
        </div>
      )}

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
                {isEnrolled ? (
                  <ReactPlayer
                    url={currentVideo}
                    controls
                    width="100%"
                    height="100%"
                    onEnded={() => handleVideoEnd(currentVideoId)}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      padding: "1rem",
                      background: "#fff3e0",
                      borderRadius: "1rem",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                    }}
                  >
                    🔒 Please enroll in the course to watch the videos.
                  </div>
                )}
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
                <div style={{ width: 40, height: 40 }}>
                  <CircularProgressbar
                    value={progressPercent}
                    text={`${progressPercent}%`}
                    styles={buildStyles({
                      pathColor: "#ff6210",
                      textColor: "#333",
                      trailColor: "#eee",
                      textSize: "30px",
                    })}
                  />
                </div>
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
        <CustomAlert
          visible={alertVisible}
          message={alertMessage}
          onClose={() => setAlertVisible(false)}
        />
      </div>

      {/* Course Description & Details */}
      <div className="details-section">
        <div className="card">
          <h2>Course Description</h2>
          <p>
            {courseInfo?.CourseDesc || "A detailed course on React concepts."}
          </p>

          {!isEnrolled && (
            <div className="enroll">
              <button onClick={handleEnroll}>Enroll Now</button>
            </div>
          )}

          {isEnrolled && (
            <div className="enroll">
              <button className="enrolled-button" disabled>
                Enrolled
              </button>
            </div>
          )}

          {enrollSuccess && (
            <p
              style={{ color: "green", textAlign: "center", marginTop: "10px" }}
            >
              ✅ You have successfully enrolled for this course!
            </p>
          )}
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

import { useState, useEffect, useRef } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import { db } from "../../firebaseinit_folder/FirebaseAuth";
import "./InternPage.css";
import logo from "../../images/LOGO.jpg"; // adjust path if it's inside a subfolder like ./assets/logo.jpg
import InternMaestroHub from "../Course/InternCoursePage";

function InternLandingPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const scrollContainerRef = useRef(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("all");

  const userRole = "Intern";

  useEffect(() => {
    const state = location.state;
    if (state && state.tab === "enrolled") {
      setActiveTab("enrolled");
    } else {
      setActiveTab("all");
    }
  }, [location.state]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeCourses = onSnapshot(
      collection(db, "allcourses"),
      (snapshot) => {
        const coursesData = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            if (!data || !data.id || !data.name) return null; // skip invalid
            return { id: data.id, ...data };
          })
          .filter(Boolean); // remove nulls
        setAllCourses(coursesData);
      },
      (error) => {
        console.error("Error fetching courses:", error);
      }
    );

    const unsubscribeEnrollments = onSnapshot(
      collection(db, "enrollments"),
      (snapshot) => {
        const enrollData = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            if (!data || !data.courseId) return null;
            return { id: doc.id, ...data };
          })
          .filter(Boolean);
        setEnrolledCourses(enrollData);
      },
      (error) => {
        console.error("Error fetching enrollments:", error);
      }
    );

    return () => {
      unsubscribeCourses();
      unsubscribeEnrollments();
    };
  }, []);

  const handleEnrollCourse = async (courseId) => {
    try {
      const docRef = await addDoc(collection(db, "enrollments"), {
        courseId,
        isEnrolled: true,
        progress: 0,
      });
      setEnrolledCourses([
        ...enrolledCourses,
        { id: docRef.id, courseId, progress: 0 },
      ]);
    } catch (error) {
      console.error("Error enrolling:", error);
    }
  };

  const handleUnenrollCourse = async (courseId) => {
    try {
      const toDelete = enrolledCourses.find((e) => e.courseId === courseId);
      if (toDelete) {
        await deleteDoc(doc(db, "enrollments", toDelete.id));
        setEnrolledCourses(enrolledCourses.filter((e) => e.id !== toDelete.id));
      }
    } catch (error) {
      console.error("Error unenrolling:", error);
    }
  };

  const filteredCourses = allCourses.filter((course) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      course.name.toLowerCase().includes(searchLower) ||
      (course.category && course.category.toLowerCase().includes(searchLower));

    if (activeTab === "enrolled") {
      return (
        enrolledCourses.some((ec) => ec.courseId === course.id) && matchesSearch
      );
    }
    return matchesSearch;
  });

  const isEnrolled = (courseId) => {
    return enrolledCourses.some((ec) => ec.courseId === courseId);
  };

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="learning-platform">
            {/* ⬇️ HEADER SECTION */}
            <header className="platform-header">
              <div className="header-content">
                <div className="branding">
                  <img
                    src={logo}
                    alt="Maestrominds Logo"
                    className="logo"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/40x40?text=MM";
                    }}
                  />
                  <div className="branding-text">
                    <h1>MaestroHub</h1>
                    <p className="subtitle">Learning Platform</p>
                  </div>
                </div>
                <div className="header-actions">
                  <div className="search-bar">
                    <input
                      type="text"
                      placeholder={`Search ${
                        activeTab === "all" ? "all" : "my"
                      } courses...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <i className="search-icon">🔍</i>
                  </div>

                  <div className="nav-tabs">
                    <button
                      className={`tab-btn ${
                        activeTab === "all" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("all")}
                    >
                      All Courses
                    </button>
                    <button
                      className={`tab-btn ${
                        activeTab === "enrolled" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("enrolled")}
                    >
                      My Courses
                    </button>
                  </div>
                </div>
              </div>
            </header>
            {/* ⬆️ HEADER SECTION */}

            {/* ⬇️ MAIN SECTION */}

            <main className="platform-main">
              {activeTab === "all" && (
                <>
                  {searchTerm === "" &&
                    enrolledCourses.some((enrollment) =>
                      allCourses.some(
                        (course) => course.id === enrollment.courseId
                      )
                    ) && (
                      <section className="enrolled-courses-section">
                        <div className="section-header">
                          <h2>Continue Learning</h2>
                          <p>Your enrolled courses</p>
                        </div>
                        <div className="scroll-container">
                          <button
                            className="scroll-arrow left-arrow"
                            onClick={scrollLeft}
                          >
                            &lt;
                          </button>
                          <div
                            className="enrolled-courses-scroll"
                            ref={scrollContainerRef}
                          >
                            {enrolledCourses.map((enrollment) => {
                              const course = allCourses.find(
                                (c) => c.id === enrollment.courseId
                              );
                              if (!course) return null;

                              return (
                                <div
                                  key={`enrolled-${enrollment.id}`}
                                  className="enrolled-course-card"
                                >
                                  <div className="course-media">
                                    <img
                                      src={course.thumbnailUrl}
                                      alt={course.name}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          "https://placehold.co/300x200?text=No+Image";
                                      }}
                                      style={{
                                        width: "100%",
                                        height: "180px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                      }}
                                    />

                                    <div className="progress-container">
                                      <div className="progress-bar">
                                        <div
                                          className="progress-fill"
                                          style={{
                                            width: `${enrollment.progress}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span>
                                        {enrollment.progress}% Complete
                                      </span>
                                    </div>
                                  </div>
                                  <div className="course-details">
                                    <h3>{course.name}</h3>
                                    <p className="instructor">
                                      By {course.instructor}
                                    </p>
                                    <p className="description">
                                      {course.description}
                                    </p>
                                    <div className="course-actions">
                                      <button
                                        className="continue-btn"
                                        onClick={() =>
                                          navigate(`/course/${course.id}`)
                                        }
                                      >
                                        Continue Learning
                                      </button>
                                      <button
                                        className="unenroll-btn"
                                        onClick={() =>
                                          handleUnenrollCourse(
                                            enrollment.courseId
                                          )
                                        }
                                      >
                                        Unenroll
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <button
                            className="scroll-arrow right-arrow"
                            onClick={scrollRight}
                          >
                            &gt;
                          </button>
                        </div>
                      </section>
                    )}

                  <section className="all-courses-section">
                    <div className="section-header">
                      <h2>Explore Our Courses</h2>
                      <p>{allCourses.length} courses available</p>
                    </div>
                    <div className="courses-grid">
                      {filteredCourses.map((course) => (
                        <div
                          key={`course-${course.id}`}
                          className="course-card"
                          onClick={() => navigate(`/course/${course.id}`)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="card-media">
                            <img
                              src={course.thumbnailUrl}
                              alt={course.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://placehold.co/300x200?text=No+Image";
                              }}
                              style={{
                                width: "100%",
                                height: "180px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                            />

                            {isEnrolled(course.id) && (
                              <div className="enrolled-badge">Enrolled</div>
                            )}
                          </div>
                          <div className="card-body">
                            <div className="course-meta">
                              <span className="category">
                                {course.category || "General"}
                              </span>
                              <span className="duration">
                                {course.overallDuration}
                              </span>
                            </div>
                            <h3>{course.name}</h3>
                            <p className="description">{course.description}</p>
                            <div className="card-actions">
                              <button
                                className={`enroll-btn ${
                                  isEnrolled(course.id) ? "enrolled" : ""
                                }`}
                                onClick={() =>
                                  isEnrolled(course.id)
                                    ? null
                                    : handleEnrollCourse(course.id)
                                }
                              >
                                {isEnrolled(course.id)
                                  ? "Continue"
                                  : "Enroll Now"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {activeTab === "enrolled" && (
                <section className="my-courses-vertical">
                  <div className="section-header">
                    <h2>My Courses</h2>
                    <p>
                      {searchTerm
                        ? `Search results for "${searchTerm}"`
                        : `Showing ${enrolledCourses.length} enrolled courses`}
                    </p>
                  </div>
                  <div className="vertical-courses-list">
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => {
                        const enrollment = enrolledCourses.find(
                          (ec) => ec.courseId === course.id
                        );
                        if (!enrollment) return null;

                        return (
                          <div
                            key={`mycourse-${course.id}`}
                            className="vertical-course-card"
                          >
                            <div className="course-media">
                              <img
                                src={course.thumbnailUrl}
                                alt={course.name}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://placehold.co/300x200?text=No+Image";
                                }}
                                style={{
                                  width: "100%",
                                  height: "180px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                }}
                              />

                              <div className="progress-container">
                                <div className="progress-bar">
                                  <div
                                    className="progress-fill"
                                    style={{ width: `${enrollment.progress}%` }}
                                  ></div>
                                </div>
                                <span>{enrollment.progress}% Complete</span>
                              </div>
                            </div>
                            <div className="course-details">
                              <h3>{course.name}</h3>
                              <div className="course-meta">
                                <span className="instructor">
                                  By {course.instructor}
                                </span>
                                <span className="duration">
                                  {course.overallDuration}
                                </span>
                                <span className="level">{course.level}</span>
                              </div>
                              <p className="description">
                                {course.description}
                              </p>
                              <div className="card-actions">
                                <button
                                  className="continue-btn"
                                  onClick={() =>
                                    navigate(`/course/${course.id}`)
                                  }
                                >
                                  Continue Learning
                                </button>
                                <button
                                  className="unenroll-btn"
                                  onClick={() =>
                                    handleUnenrollCourse(course.id)
                                  }
                                >
                                  Unenroll
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="no-results">
                        {searchTerm
                          ? "No enrolled courses match your search"
                          : "You have no enrolled courses yet"}
                      </div>
                    )}
                  </div>
                </section>
              )}
            </main>
          </div>
        }
      />

      <Route path="/interncourse/:id" element={<InternMaestroHub />} />
    </Routes>
  );
}

export default InternLandingPage;

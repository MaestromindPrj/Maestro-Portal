import { useState, useEffect, useRef } from "react";
import CustomAlert from "../../utilities/CustomAlert";
import CustomConfirm from "../../utilities/CustomConfirm"
import {
  collection,
  onSnapshot,
  getDocs,
  addDoc,
  deleteDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import { useNavigate, Routes, Route } from "react-router-dom";
import { db } from "../../firebaseinit_folder/FirebaseAuth";
import "./AdminPage.css";
import logo from "../../images/LOGO.jpg";
import AdminMaestroHub from "../Admin_Course/AdminCoursePage";

function AdminLandingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [newCourse, setNewCourse] = useState({
    name: "",
    category: "",
    description: "",
    level: "Beginner",
    instructor: "",
    aboutInstructor: "",
    thumbnailUrl: "",
    overallDuration: "",
    sections: [
      {
        title: "",
        videos: [{ title: "", videoUrl: "" }],
      },
    ],
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const scrollContainerRef = useRef(null);
  const [allCourses, setAllCourses] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState(() => {});

  const userRole = "Admin";

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

    return () => {
      unsubscribeCourses();
    };
  }, []);

  const handleAddCourse = async () => {
    try {
      const courseId = newCourse.name.toLowerCase().replace(/\s+/g, "_");

      // 1. Add to allcourses collection
      await addDoc(collection(db, "allcourses"), {
        id: courseId,
        name: newCourse.name,
        category: newCourse.category,
        description: newCourse.description,
        level: newCourse.level,
        instructor: newCourse.instructor,
        thumbnailUrl: newCourse.thumbnailUrl,
        isEnrolled: false,
        overallDuration: newCourse.overallDuration,
        aboutInstructor: newCourse.aboutInstructor,

        progress: 0,
      });

      // 2. Create courseId collection and add metadata doc
      await setDoc(doc(db, courseId, "metadata"), {
        CourseName: newCourse.name,
        CourseDesc: newCourse.description,
        Instructor: newCourse.instructor,
        ThumbnailUrl: newCourse.thumbnailUrl,
        Level: newCourse.level,
        Category: newCourse.category,
        Sections: newCourse.sections,
        Duration: newCourse.overallDuration,
        AboutInstructor: newCourse.aboutInstructor,
      });

      // 3. Add videos as msth_video_#
      let videoCount = 1;
      for (const section of newCourse.sections) {
        for (const video of section.videos) {
          const videoID = video.videoUrl.slice(-11);
          const videoDocId = `msth_video_${videoCount}`;
          await setDoc(doc(db, courseId, videoDocId), {
            videoID,
          });
          videoCount++;
        }
      }

      setAlertMessage("✅ Course created successfully!");
      setAlertVisible(true);

      setShowAddForm(false);
      setNewCourse({
        name: "",
        category: "",
        description: "",
        level: "Beginner",
        instructor: "",
        thumbnailUrl: "",
        overallDuration: "",
        aboutInstructor: "",
        sections: [
          {
            title: "",
            videos: [{ title: "", videoUrl: "" }],
          },
        ],
      });
    } catch (error) {
      console.error("Error adding course:", error);
      setAlertMessage("Failed to add course");
      setAlertVisible(true);
    }
  };

  const updateSectionTitle = (index, title) => {
    const updated = [...newCourse.sections];
    updated[index].title = title;
    setNewCourse({ ...newCourse, sections: updated });
  };

  const removeSection = (index) => {
    const updated = [...newCourse.sections];
    updated.splice(index, 1);
    setNewCourse({ ...newCourse, sections: updated });
  };

  const removeVideoFromSection = (sectionIndex, videoIndex) => {
    const updated = [...newCourse.sections];
    updated[sectionIndex].videos.splice(videoIndex, 1);
    setNewCourse({ ...newCourse, sections: updated });
  };

  const handleVideoUrlChange = (sectionIndex, videoIndex, url) => {
    const updated = [...newCourse.sections];
    updated[sectionIndex].videos[videoIndex].videoUrl = url;
    setNewCourse({ ...newCourse, sections: updated });
  };

  const addVideoToSection = (sectionIndex) => {
    const updated = [...newCourse.sections];
    updated[sectionIndex].videos.push({
      title: "",
      videoUrl: "",
    });
    setNewCourse({ ...newCourse, sections: updated });
  };

  const addSection = () => {
    setNewCourse({
      ...newCourse,
      sections: [...newCourse.sections, { title: "", videos: [] }],
    });
  };

  const filteredCourses = allCourses.filter((course) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      searchTerm === "" ||
      course.name.toLowerCase().includes(searchLower) ||
      (course.category && course.category.toLowerCase().includes(searchLower))
    );
  });

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  // 1️⃣ This actually does the work
  const performDeleteCourse = async (courseId) => {
    try {
      // 1. Delete from 'allcourses'
      const snapshot = await getDocs(collection(db, "allcourses"));
      const match = snapshot.docs.find((d) => d.data().id === courseId);
      if (match) await deleteDoc(doc(db, "allcourses", match.id));

      // 2. Delete entire course collection
      const courseCollection = await getDocs(collection(db, courseId));
      for (const docSnap of courseCollection.docs) {
        await deleteDoc(doc(db, courseId, docSnap.id));
      }

      // 3. UI refresh
      setAlertMessage("🗑 Course deleted successfully.");
      setAlertVisible(true);
      setAllCourses((courses) => courses.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error("Error deleting course:", err);
      setAlertMessage("Failed to delete course");
      setAlertVisible(true);
    }
  };

  // 2️⃣ This just *asks* for confirmation
  const handleDeleteClick = (courseId) => {
    setConfirmCallback(() => () => performDeleteCourse(courseId));
    setConfirmVisible(true);
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
                      placeholder="Search all courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <i className="search-icon">🔍</i>
                  </div>

                  <div className="nav-tabs">
                    <button className="tab-btn active" disabled>
                      All Courses
                    </button>
                  </div>

                  <button
                    className="add-course-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                  >
                    + Add Course
                  </button>
                </div>
              </div>
            </header>
            {/* ⬆️ HEADER SECTION */}

            {/* ⬇️ MAIN SECTION */}

            <main className="platform-main">
              {showAddForm && (
                <div className="course-form-container">
                  <div className="course-form">
                    <h2>Create New Course</h2>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Course Title*</label>
                        <input
                          type="text"
                          value={newCourse.name}
                          onChange={(e) =>
                            setNewCourse({ ...newCourse, name: e.target.value })
                          }
                          placeholder="e.g. Advanced React"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Instructor Name*</label>
                        <input
                          type="text"
                          value={newCourse.instructor}
                          onChange={(e) =>
                            setNewCourse({
                              ...newCourse,
                              instructor: e.target.value,
                            })
                          }
                          placeholder="e.g. John Doe"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Thumbnail Image URL*</label>
                        <input
                          type="url"
                          value={newCourse.thumbnailUrl}
                          onChange={(e) =>
                            setNewCourse({
                              ...newCourse,
                              thumbnailUrl: e.target.value,
                            })
                          }
                          placeholder="Paste image URL ending in .jpg or .png"
                          pattern="https://.*\.(jpg|jpeg|png|webp)"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Category*</label>
                        <input
                          type="text"
                          value={newCourse.category}
                          onChange={(e) =>
                            setNewCourse({
                              ...newCourse,
                              category: e.target.value,
                            })
                          }
                          placeholder="e.g. Web Development"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Level*</label>
                        <select
                          value={newCourse.level}
                          onChange={(e) =>
                            setNewCourse({
                              ...newCourse,
                              level: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                      <div className="form-group span-2">
                        <label>Description*</label>
                        <textarea
                          value={newCourse.description}
                          onChange={(e) =>
                            setNewCourse({
                              ...newCourse,
                              description: e.target.value,
                            })
                          }
                          placeholder="Course description..."
                          rows="4"
                          required
                        />
                      </div>
                      <div className="form-group span-2">
                        <label>About Instructor*</label>
                        <textarea
                          value={newCourse.aboutInstructor}
                          onChange={(e) =>
                            setNewCourse({
                              ...newCourse,
                              aboutInstructor: e.target.value,
                            })
                          }
                          placeholder="Brief details about the instructor..."
                          rows="3"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Overall Duration*</label>
                        <input
                          type="text"
                          value={newCourse.overallDuration}
                          onChange={(e) =>
                            setNewCourse({
                              ...newCourse,
                              overallDuration: e.target.value,
                            })
                          }
                          placeholder="e.g. 5 hours"
                          required
                        />
                      </div>

                      <div className="form-group span-2">
                        <label>Course Sections & Videos</label>
                        <div className="sections-container">
                          {newCourse.sections.length === 0 ? (
                            <p className="no-sections">No sections added yet</p>
                          ) : (
                            newCourse.sections.map((section, sectionIndex) => (
                              <div
                                key={`section-${sectionIndex}`}
                                className="section-card"
                              >
                                <div className="section-header">
                                  <input
                                    type="text"
                                    value={section.title}
                                    onChange={(e) =>
                                      updateSectionTitle(
                                        sectionIndex,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Section title"
                                    className="section-title-input"
                                  />
                                  <button
                                    className="section-remove-btn"
                                    onClick={() => removeSection(sectionIndex)}
                                  >
                                    Remove
                                  </button>
                                </div>

                                <div className="videos-container">
                                  {section.videos.map((video, videoIndex) => (
                                    <div
                                      key={`video-${sectionIndex}-${videoIndex}`}
                                      className="video-input-group"
                                    >
                                      <input
                                        type="text"
                                        value={video.title}
                                        onChange={(e) => {
                                          const updatedSections = [
                                            ...newCourse.sections,
                                          ];
                                          updatedSections[sectionIndex].videos[
                                            videoIndex
                                          ].title = e.target.value;
                                          setNewCourse({
                                            ...newCourse,
                                            sections: updatedSections,
                                          });
                                        }}
                                        placeholder={`Video ${
                                          sectionIndex + 1
                                        }.${videoIndex + 1} Title`}
                                      />

                                      <input
                                        type="url"
                                        value={video.videoUrl}
                                        onChange={(e) =>
                                          handleVideoUrlChange(
                                            sectionIndex,
                                            videoIndex,
                                            e.target.value
                                          )
                                        }
                                        placeholder="https://example.com/video"
                                        pattern="https://.*"
                                        required
                                      />

                                      <button
                                        className="remove-video-btn"
                                        onClick={() =>
                                          removeVideoFromSection(
                                            sectionIndex,
                                            videoIndex
                                          )
                                        }
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    className="add-video-btn"
                                    onClick={() =>
                                      addVideoToSection(sectionIndex)
                                    }
                                  >
                                    + Add Video
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                          <button
                            className="add-section-btn"
                            onClick={addSection}
                          >
                            + Add Section
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button
                        className="secondary-btn"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </button>
                      <button className="primary-btn" onClick={handleAddCourse}>
                        Create Course
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <section className="all-courses-section">
                <div className="section-header">
                  <h2>Explore Our Courses</h2>
                  <p>{allCourses.length} Courses available</p>
                </div>
                <div className="courses-grid">
                  {filteredCourses.map((course) => (
                    <div
                      key={`course-${course.id}`}
                      className="course-card"
                      onClick={() => navigate(`/admincourse/${course.id}`)}
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
                            className="delete-course-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(course.id);
                            }}
                          >
                            Delete Course
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <CustomAlert
                visible={alertVisible}
                message={alertMessage}
                onClose={() => setAlertVisible(false)}
              />
              <CustomConfirm
                visible={confirmVisible}
                message="Are you sure you want to delete this course?"
                onCancel={() => setConfirmVisible(false)}
                onConfirm={() => {
                  confirmCallback();
                  setConfirmVisible(false);
                }}
              />
            </main>
          </div>
        }
      />
      <Route path="/admincourse/:id" element={<AdminMaestroHub />} />
    </Routes>
  );
}

export default AdminLandingPage;

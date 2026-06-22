import { BrowserRouter, Routes, Route } from "react-router-dom";

/* COMMON */
import RoleRedirect from "./components/common/RoleRedirect";
import ProtectedRoute from "./components/common/ProtectedRoute";

/* AUTH */
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

/* LAYOUTS */
import AdminLayout from "./components/layout/AdminLayout";
import InstructorLayout from "./components/layout/InstructorLayout";
import StudentLayout from "./components/layout/StudentLayout";

/* ADMIN */
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import SystemLogs from "./pages/admin/SystemLogs";
import Settings from "./pages/admin/Settings";
import AdminProfile from "./pages/admin/Profile";

/* INSTRUCTOR */
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import AssessmentBuilder from "./pages/instructor/AssessmentBuilder";
import ManageAssessments from "./pages/instructor/ManageAssessments";
import PendingAIQuestions from "./pages/instructor/PendingAIQuestions";
import EvaluateSubmissions from "./pages/instructor/EvaluateSubmissions";
import ViewResponse from "./pages/instructor/ViewResponse";
import InstructorProfile from "./pages/instructor/InstructorProfile";
import InstructorAnalytics from "./pages/instructor/InstructorAnalytics";

/* STUDENT */
import StudentDashboard from "./pages/student/StudentDashboard";
import MyAssessments from "./pages/student/MyAssessments";
import AssessmentDetails from "./pages/student/AssessmentDetails";
import AttemptAssessment from "./pages/student/AttemptAssessment";
import MySubmissions from "./pages/student/MySubmissions";
import SubmissionSuccess from "./pages/student/SubmissionSuccess";
import StudentProfile from "./pages/student/StudentProfile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ROOT */}
        <Route path="/" element={<RoleRedirect />} />

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="logs" element={<SystemLogs />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* INSTRUCTOR */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute allowedRoles={["instructor"]}>
              <InstructorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="builder" element={<AssessmentBuilder />} />
          <Route path="builder/:assessmentId" element={<AssessmentBuilder />} />
          <Route path="tests" element={<ManageAssessments />} />

          {/* AI QUESTIONS */}
          <Route
            path="ai-questions/:assessmentId"
            element={<PendingAIQuestions />}
          />

          {/* ✅ EVALUATION FLOW (CORRECT) */}
          <Route
            path="evaluate/:assessmentId"
            element={<EvaluateSubmissions />}
          />
          <Route
            path="evaluate/submission/:submissionId"
            element={<ViewResponse />}
          />

          {/* ANALYTICS */}
          <Route
            path="analytics/:assessmentId"
            element={<InstructorAnalytics />}
          />

          <Route path="profile" element={<InstructorProfile />} />
        </Route>

        {/* STUDENT */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="assessments" element={<MyAssessments />} />
          <Route path="assessments/:id" element={<AssessmentDetails />} />
          <Route path="attempt/:submissionId" element={<AttemptAssessment />} />
          <Route path="submissions" element={<MySubmissions />} />
          <Route path="success" element={<SubmissionSuccess />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
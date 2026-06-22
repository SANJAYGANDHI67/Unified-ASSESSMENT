import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import { Button } from "../../components/ui/button";
import MCQQuestion from "../../components/ui/MCQQuestion";

export default function AssessmentBuilder() {
  const navigate = useNavigate();
  const { assessmentId: urlId } = useParams();

  /* ======================
     CORE STATE
  ====================== */
  const [assessmentId, setAssessmentId] = useState(urlId || null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  /* ======================
     META

====================== */
const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [totalMarks, setTotalMarks] = useState(0);

/* 🔴 ADD THESE TWO LINES ONLY */
const [subject, setSubject] = useState("");
const [syllabusTopicsText, setSyllabusTopicsText] = useState("");
  /* ======================
     QUESTION CONFIG
  ====================== */
  const [mode, setMode] = useState("MIXED");
  const [difficulty, setDifficulty] = useState("MEDIUM");

  const [mcqConfig, setMcqConfig] = useState({
    count: 0,
    marks_each: 1,
  });

  const [descriptiveConfig, setDescriptiveConfig] = useState({
    2: 0,
    5: 0,
    10: 0,
    15: 0,
  });

  /* ======================
     APPROVED QUESTIONS
  ====================== */
  const [approvedQuestions, setApprovedQuestions] = useState([]);

  /* ======================
     SYLLABUS
  ====================== */
  const fileRef = useRef(null);
  const [syllabusUploaded, setSyllabusUploaded] = useState(false);

  /* ======================
     LOAD ASSESSMENT
  ====================== */
 
  useEffect(() => {
    if (!assessmentId) return;

    const load = async () => {
      try {
        const res = await api.get(`/assessments/${assessmentId}`);
        const a = res.data;

        setTitle(a.title || "");
        setDescription(a.description || "");
        setTotalMarks(Number(a.total_marks) || 0);

        // ✅ NEW — LOAD DB FIELDS
        setSubject(a.subject || "");

        if (a.syllabus_topics) {
          const topics =
            typeof a.syllabus_topics === "string"
              ? JSON.parse(a.syllabus_topics)
              : a.syllabus_topics;

          setSyllabusTopicsText(
            Array.isArray(topics) ? topics.join("\n") : ""
          );
        }

        if (a.question_config) {
          const qc =
            typeof a.question_config === "string"
              ? JSON.parse(a.question_config)
              : a.question_config;

          setMode(qc?.mode || "MIXED");
          setDifficulty(qc?.difficulty || "MEDIUM");

          if (qc?.mcq) {
            setMcqConfig({
              count: Number(qc.mcq.count) || 0,
              marks_each: Number(qc.mcq.marks_each) || 1,
            });
          }

          if (qc?.descriptive) {
            setDescriptiveConfig({
              2: Number(qc.descriptive["2"]) || 0,
              5: Number(qc.descriptive["5"]) || 0,
              10: Number(qc.descriptive["10"]) || 0,
              15: Number(qc.descriptive["15"]) || 0,
            });
          }
        }

        setSyllabusUploaded(Boolean(a.syllabus_path));

        const qRes = await api.get(`/assessments/${assessmentId}/questions`);
        setApprovedQuestions(Array.isArray(qRes.data) ? qRes.data : []);
      } catch (err) {
        console.error(err);
        alert("Failed to load assessment");
      }
    };

    load();
  }, [assessmentId]);
  /* ======================
     SAVE DRAFT

     ====================== */
     const handleSaveDraft = async () => {
      if (!title || !totalMarks) {
        alert("Title and total marks required");
        return;
      }
  
      // ✅ NEW — NORMALIZE TOPICS FOR DB
      const syllabus_topics = syllabusTopicsText
        .split("\n")
        .map(t => t.trim())
        .filter(Boolean);
  
      const question_config = {
        mode,
        difficulty,
        mcq: mode !== "DESCRIPTIVE" ? mcqConfig : null,
        descriptive: mode !== "OBJECTIVE" ? descriptiveConfig : null,
      };
  
      try {
        setLoading(true);
  
        if (!assessmentId) {
          const res = await api.post("/assessments", {
            title,
            description,
            total_marks: totalMarks,
            subject,
            syllabus_topics,
            question_config,
          });
  
          setAssessmentId(res.data.id);
          navigate(`/instructor/builder/${res.data.id}`, { replace: true });
          alert("Draft created");
        } else {
          await api.put(`/assessments/${assessmentId}`, {
            title,
            description,
            total_marks: totalMarks,
            subject,
            syllabus_topics,
            question_config,
          });
          alert("Draft updated");
        }
      } catch (err) {
        console.error(err);
        alert("Save failed");
      } finally {
        setLoading(false);
      }
    }; 
  

  /* ======================
     UPLOAD SYLLABUS
  ====================== */
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!assessmentId) {
      alert("Save draft first");
      return;
    }

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("syllabus", file);

      await api.post(`/assessments/${assessmentId}/upload-syllabus`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSyllabusUploaded(true);
      fileRef.current.value = null;
      alert("Syllabus uploaded successfully");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ======================
     AI REVIEW
  ====================== */
 const handleGenerateAI = () => {
  const totalQ =
    mcqConfig.count +
    Object.values(descriptiveConfig).reduce((a, b) => a + b, 0);

     // ✅ HARD BLOCK — REQUIRED FOR PERMANENT FIX
     if (!subject || !syllabusTopicsText.trim()) {
      alert("Subject and syllabus topics are required");
      return;
    }

  if (!syllabusUploaded) {
    alert("Upload syllabus first");
    return;
  }

  if (totalQ === 0) {
    alert("Configure at least one question");
    return;
  }

  if (mode === "MIXED" && mcqConfig.count > 0) {
    const hasDesc = Object.values(descriptiveConfig).some(v => v > 0);
    if (!hasDesc) {
      alert("In MIXED mode, add at least one descriptive question");
      return;
    }
  }

  navigate(`/instructor/ai-questions/${assessmentId}`);
};

  /* ======================
     PUBLISH
  ====================== */
  const handlePublish = async () => {
    if (!approvedQuestions.length) {
      alert("Approve at least one question");
      return;
    }

    const approvedMarks = approvedQuestions.reduce(
      (s, q) => s + Number(q.marks || 0),
      0
    );

    if (approvedMarks !== totalMarks) {
      alert("Approved marks must equal total marks");
      return;
    }

    if (!window.confirm("Publish assessment?")) return;

    try {
      await api.put(`/assessments/${assessmentId}`, { status: "published" });
      navigate("/instructor/tests");
    } catch {
      alert("Publish failed");
    }
  };

  /* ======================
     UI
  ====================== */
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Assessment Builder</h1>

      {/* META */}
      <section className="bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-4">Assessment Details</h2>

        <input className="border p-2 w-full mb-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="border p-2 w-full mb-2" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <textarea className="border p-2 w-full mb-2" placeholder="Syllabus topics (one per line)" value={syllabusTopicsText} onChange={(e) => setSyllabusTopicsText(e.target.value)} />
        <textarea className="border p-2 w-full mb-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="number" className="border p-2 w-40" placeholder="Total Marks" value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value) || 0)} />
      </section>

      {/* CONFIG */}
      <section className="bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-4">Question Configuration</h2>

        <label className="block mb-1 font-medium">Difficulty Level</label>
        <select className="border p-2 mb-4" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        <select className="border p-2 mb-4" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="MIXED">Mixed</option>
          <option value="OBJECTIVE">Objective</option>
          <option value="DESCRIPTIVE">Descriptive</option>
        </select>

        {mode !== "DESCRIPTIVE" && (
          <div className="flex gap-3 items-center mb-3">
            <span>MCQ</span>
            <input className="border w-20 p-1" value={mcqConfig.count} onChange={(e) => setMcqConfig((p) => ({ ...p, count: Number(e.target.value) || 0 }))} />
            ×
            <input className="border w-20 p-1" value={mcqConfig.marks_each} onChange={(e) => setMcqConfig((p) => ({ ...p, marks_each: Number(e.target.value) || 1 }))} />
          </div>
        )}

        {mode !== "OBJECTIVE" && (
          <div className="grid grid-cols-2 gap-3">
            {[2, 5, 10, 15].map((m) => (
              <div key={m}>
                {m} marks
                <input className="border ml-2 w-20 p-1" value={descriptiveConfig[m]} onChange={(e) => setDescriptiveConfig((p) => ({ ...p, [m]: Number(e.target.value) || 0 }))} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ACTIONS */}
      <section className="bg-white p-6 rounded shadow space-y-4">
        <input ref={fileRef} type="file" accept=".pdf" hidden onChange={handleUpload} />

        <Button variant={syllabusUploaded ? "success" : "outline"} disabled={uploading} onClick={() => fileRef.current.click()}>
          {uploading ? "Uploading..." : syllabusUploaded ? "Syllabus Uploaded ✓ (Click to Re-upload)" : "Upload Syllabus"}
        </Button>

        <div className="flex gap-3">
          <Button onClick={handleSaveDraft} disabled={loading}>Save Draft</Button>
          <Button onClick={handleGenerateAI}>Review AI Questions</Button>
          <Button onClick={handlePublish}>Publish</Button>
        </div>
      </section>

      {/* APPROVED QUESTIONS */}
      {approvedQuestions.length > 0 && (
        <section className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold mb-3">Approved Questions ({approvedQuestions.length})</h2>
          {approvedQuestions.map((q, i) => (
            <div key={q.id} className="border p-3 rounded mb-2">
              <b>{i + 1}. {q.question}</b>
              <div className="text-sm text-gray-600">{q.marks} marks · {q.question_type}</div>
              {q.question_type === "mcq" && <MCQQuestion question={q} />}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
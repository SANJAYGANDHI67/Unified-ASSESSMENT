import { useNavigate } from "react-router-dom";

export default function SubmissionSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-gray-200 p-10 text-center">

        {/* SUCCESS ICON */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center shadow-inner animate-pulse">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Submission Successful 🎉
        </h2>

        {/* DESCRIPTION */}
        <p className="text-gray-600 text-base mb-6 leading-relaxed">
          Your assessment has been submitted successfully.
          <br />
          <span className="text-gray-800 font-medium">
            AI-assisted evaluation
          </span>{" "}
          will process your answers and results will be available soon.
        </p>

        {/* INFO BOX */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-sm text-blue-700">
          💡 You can track evaluation status and scores from your dashboard or
          submissions page.
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3"
              />
            </svg>
            Go to Dashboard
          </button>

          <button
            onClick={() => navigate("/student/submissions")}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17v-2a4 4 0 014-4h4m0 0l-3-3m3 3l-3 3M3 7h6"
              />
            </svg>
            View My Submissions
          </button>
        </div>

        {/* FOOTER NOTE */}
        <p className="mt-8 text-xs text-gray-400">
          You may safely close this page or continue exploring your dashboard.
        </p>
      </div>
    </div>
  );
}
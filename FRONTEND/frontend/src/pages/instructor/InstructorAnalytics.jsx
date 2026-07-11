import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import api from '../../lib/api';
import {
  RefreshCw, FileText, FileSpreadsheet, Search, ChevronRight, ChevronLeft,
  ArrowUpDown, AlertTriangle, AlertCircle, CheckCircle2, XCircle, Info,
  TrendingUp, TrendingDown, Users, Target, Clock, ClipboardList, Brain,
  Gauge, Sparkles, UserCog, ClipboardCheck, RotateCcw, Inbox,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, PolarAngleAxis,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';

const CHART_COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];
const PASS_FAIL_COLORS = ['#10B981', '#EF4444'];

const ACCENT_STYLES = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', bar: 'bg-indigo-600' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', bar: 'bg-cyan-600' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', bar: 'bg-violet-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-600' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', bar: 'bg-rose-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-600' },
};

const STATUS_STYLE_MAP = {
  easy: 'emerald', low: 'emerald', pass: 'emerald', completed: 'emerald', evaluated: 'emerald',
  medium: 'amber', ongoing: 'amber', pending: 'amber', pending_evaluation: 'amber',
  hard: 'rose', high: 'rose', critical: 'rose', fail: 'rose', failed: 'rose',
};

const TONE_CLASSES = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  rose: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  gray: 'bg-gray-100 text-gray-600 ring-gray-500/20',
};

const INSIGHT_CONFIG = {
  warning: { icon: AlertTriangle, classes: 'border-amber-200 bg-amber-50', iconClasses: 'text-amber-600' },
  success: { icon: CheckCircle2, classes: 'border-emerald-200 bg-emerald-50', iconClasses: 'text-emerald-600' },
  info: { icon: Info, classes: 'border-indigo-200 bg-indigo-50', iconClasses: 'text-indigo-600' },
  danger: { icon: AlertCircle, classes: 'border-rose-200 bg-rose-50', iconClasses: 'text-rose-600' },
};

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'pending_evaluation', label: 'Pending Evaluation' },
  { value: 'evaluated', label: 'Evaluated' },
];

const DEFAULT_FILTERS = { assessmentId: 'all', startDate: '', endDate: '', status: 'all', search: '' };

const KPI_CONFIG = [
  { key: 'totalAssessments', label: 'Total Assessments', icon: ClipboardList, accent: 'indigo', suffix: '' },
  { key: 'studentsAttempted', label: 'Students Attempted', icon: Users, accent: 'cyan', suffix: '' },
  { key: 'averageScore', label: 'Average Score', icon: Target, accent: 'violet', suffix: '%' },
  { key: 'highestScore', label: 'Highest Score', icon: TrendingUp, accent: 'emerald', suffix: '%' },
  { key: 'lowestScore', label: 'Lowest Score', icon: TrendingDown, accent: 'rose', suffix: '%' },
  { key: 'passPercentage', label: 'Pass Percentage', icon: CheckCircle2, accent: 'emerald', suffix: '%' },
  { key: 'failPercentage', label: 'Fail Percentage', icon: XCircle, accent: 'rose', suffix: '%' },
  { key: 'pendingEvaluations', label: 'Pending Evaluations', icon: Clock, accent: 'amber', suffix: '' },
];

const AI_METRIC_CONFIG = [
  { key: 'accuracy', label: 'AI Evaluation Accuracy', icon: Brain, accent: 'indigo', suffix: '%', showBar: true },
  { key: 'confidence', label: 'AI Confidence', icon: Gauge, accent: 'cyan', suffix: '%', showBar: true },
  { key: 'avgAiScore', label: 'Average AI Score', icon: Sparkles, accent: 'violet', suffix: '%', showBar: false },
  { key: 'manualOverridePercentage', label: 'Manual Override', icon: UserCog, accent: 'amber', suffix: '%', showBar: true },
  { key: 'pendingAiReviews', label: 'Pending AI Reviews', icon: ClipboardCheck, accent: 'rose', suffix: '', showBar: false },
];

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200/70 rounded-lg ${className}`} />;
}

function EmptyState({ message = 'No data available', small = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${small ? 'py-8' : 'py-16'}`}>
      <Inbox className="w-9 h-9 text-gray-300 mb-3" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 bg-white rounded-xl border border-rose-100">
      <AlertTriangle className="w-10 h-10 text-rose-500 mb-3" />
      <p className="text-sm font-semibold text-gray-900 mb-1">Something went wrong</p>
      <p className="text-sm text-gray-500 mb-5 max-w-sm px-4">
        {message || 'We could not load the analytics data. Please try again.'}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Retry
      </button>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix = '', accent = 'indigo' }) {
  const styles = ACCENT_STYLES[accent] || ACCENT_STYLES.indigo;
  const display = value === undefined || value === null || value === '' ? '—' : `${value}${suffix}`;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${styles.bg}`}>
        <Icon className={`w-5 h-5 ${styles.text}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
        <p className="text-xl font-semibold text-gray-900 mt-0.5">{display}</p>
      </div>
    </div>
  );
}

function AiMetricCard({ icon: Icon, label, value, suffix, accent, showBar }) {
  const styles = ACCENT_STYLES[accent] || ACCENT_STYLES.indigo;
  const numeric = typeof value === 'number' ? value : null;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${styles.bg}`}>
          <Icon className={`w-4 h-4 ${styles.text}`} />
        </div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
      <p className="text-xl font-semibold text-gray-900">{numeric === null ? '—' : `${numeric}${suffix}`}</p>
      {showBar && numeric !== null && (
        <div className="mt-2.5 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${styles.bar}`} style={{ width: `${Math.min(100, Math.max(0, numeric))}%` }} />
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex-1 min-h-[260px]">{children}</div>
    </div>
  );
}

function InsightCard({ type = 'info', title, message }) {
  const cfg = INSIGHT_CONFIG[type] || INSIGHT_CONFIG.info;
  const Icon = cfg.icon;
  return (
    <div className={`rounded-xl border p-4 flex gap-3 ${cfg.classes}`}>
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${cfg.iconClasses}`} />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-600 mt-0.5">{message}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (!status) return <span className="text-gray-400 text-xs">—</span>;
  const key = String(status).toLowerCase().replace(/\s+/g, '_');
  const tone = STATUS_STYLE_MAP[key] || 'gray';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset whitespace-nowrap ${TONE_CLASSES[tone]}`}>
      {String(status).replace(/_/g, ' ')}
    </span>
  );
}

function useDataTable(rows, defaultSortKey, pageSize) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) => Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q)));
  }, [rows, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av ?? '').localeCompare(String(bv ?? ''))
        : String(bv ?? '').localeCompare(String(av ?? ''));
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paged = useMemo(() => sorted.slice((page - 1) * pageSize, page * pageSize), [sorted, page, pageSize]);

  const toggleSort = useCallback((key) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
        return prevKey;
      }
      setSortDir('asc');
      return key;
    });
  }, []);

  return { search, setSearch, sortKey, sortDir, toggleSort, page, setPage, totalPages, paged, totalRows: sorted.length };
}

function DataTable({ title, columns, rows, pageSize = 8, emptyMessage }) {
  const { search, setSearch, sortKey, sortDir, toggleSort, page, setPage, totalPages, paged, totalRows } =
    useDataTable(rows, columns[0]?.key, pageSize);

  const rangeStart = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalRows);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search table..."
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState small message={emptyMessage || 'No records available'} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/70">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable !== false && toggleSort(col.key)}
                      className={`px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${
                        col.sortable !== false ? 'cursor-pointer select-none hover:text-gray-700' : ''
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {col.sortable !== false && (
                          <ArrowUpDown className={`w-3 h-3 ${sortKey === col.key ? 'text-indigo-600' : 'text-gray-300'}`} />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length}>
                      <EmptyState small message="No matching records" />
                    </td>
                  </tr>
                ) : (
                  paged.map((row, i) => (
                    <tr key={row.id ?? i} className="hover:bg-gray-50/60 transition-colors">
                      {columns.map((col) => (
                        <td key={col.key} className="px-5 py-3 text-gray-700 whitespace-nowrap">
                          {col.render ? col.render(row) : row[col.key] ?? '—'}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 mt-auto">
            <span className="text-xs text-gray-500">
              Showing {rangeStart}-{rangeEnd} of {totalRows}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-md border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-600 px-2">
                {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-md border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ChartEmpty({ message }) {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <EmptyState small message={message} />
    </div>
  );
}

const QUESTION_COLUMNS = [
  { key: 'questionNumber', label: 'Q#' },
  { key: 'questionText', label: 'Question', render: (r) => <span className="block max-w-xs truncate">{r.questionText}</span> },
  { key: 'difficulty', label: 'Difficulty', render: (r) => <StatusBadge status={r.difficulty} /> },
  { key: 'avgScore', label: 'Avg Score', render: (r) => `${r.avgScore ?? 0}%` },
  { key: 'correctPercentage', label: 'Correct %', render: (r) => `${r.correctPercentage ?? 0}%` },
  { key: 'attempts', label: 'Attempts' },
];

const TOP_STUDENTS_COLUMNS = [
  { key: 'rank', label: 'Rank' },
  { key: 'studentName', label: 'Student' },
  { key: 'rollNumber', label: 'Roll No.' },
  { key: 'score', label: 'Score' },
  { key: 'percentage', label: 'Percentage', render: (r) => `${r.percentage ?? 0}%` },
  { key: 'assessmentsTaken', label: 'Assessments' },
];

const STRUGGLING_STUDENTS_COLUMNS = [
  { key: 'studentName', label: 'Student' },
  { key: 'rollNumber', label: 'Roll No.' },
  { key: 'score', label: 'Score' },
  { key: 'percentage', label: 'Percentage', render: (r) => `${r.percentage ?? 0}%` },
  { key: 'missedAssessments', label: 'Missed' },
  { key: 'riskLevel', label: 'Risk', render: (r) => <StatusBadge status={r.riskLevel} /> },
];

const ASSESSMENT_SUMMARY_COLUMNS = [
  { key: 'assessmentName', label: 'Assessment' },
  { key: 'totalStudents', label: 'Students' },
  { key: 'avgScore', label: 'Avg Score', render: (r) => `${r.avgScore ?? 0}%` },
  { key: 'passRate', label: 'Pass Rate', render: (r) => `${r.passRate ?? 0}%` },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
];

export default function InstructorAnalytics() {
  const [assessments, setAssessments] = useState([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(true);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const printRef = useRef(null);

  const fetchAssessments = useCallback(async () => {
    setAssessmentsLoading(true);
    try {
      const res = await api.get('/instructor/assessments');
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setAssessments(list);
    } catch (err) {
      setAssessments([]);
    } finally {
      setAssessmentsLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async (activeFilters, isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const params = {
        assessmentId: activeFilters.assessmentId !== 'all' ? activeFilters.assessmentId : undefined,
        startDate: activeFilters.startDate || undefined,
        endDate: activeFilters.endDate || undefined,
        status: activeFilters.status !== 'all' ? activeFilters.status : undefined,
        search: activeFilters.search || undefined,
      };
      const res = await api.get('/instructor/analytics', { params });
      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  useEffect(() => {
    fetchAnalytics(appliedFilters);
  }, [appliedFilters, fetchAnalytics]);

  const handleApplyFilters = () => setAppliedFilters(filters);
  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  };
  const handleRefresh = () => fetchAnalytics(appliedFilters, true);

  const handleExportExcel = () => {
    const rows = data?.tables?.assessmentSummary || [];
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csvBody = rows
      .map((row) => headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const csv = `${headers.join(',')}\n${csvBody}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `instructor-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Instructor Analytics Report</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111827;}
        h1{font-size:20px;margin-bottom:4px;}
        table{width:100%;border-collapse:collapse;margin-bottom:20px;}
        th,td{border:1px solid #e5e7eb;padding:6px 8px;font-size:12px;text-align:left;}
        .kpi{display:inline-block;margin:6px 14px 6px 0;font-size:12px;}
      </style></head><body>
      <h1>Instructor Analytics Report</h1>
      <p style="font-size:12px;color:#6b7280;margin-bottom:16px;">Generated on ${new Date().toLocaleString()}</p>
      ${printRef.current.innerHTML}
      </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const tables = data?.tables || {};
  const ai = data?.aiAnalytics || {};
  const insights = data?.insights || [];

  const passFailData = Array.isArray(charts.passFail) && charts.passFail.length
    ? charts.passFail
    : [
        { name: 'Pass', value: kpis.passPercentage ?? 0 },
        { name: 'Fail', value: kpis.failPercentage ?? 0 },
      ];

  const completionPercentage = charts.completionRate?.percentage ?? null;
  const evaluationProgress = charts.evaluationProgress || {};
  const evalTotal = evaluationProgress.total ?? 0;
  const evaluatedPct = evalTotal ? Math.round(((evaluationProgress.evaluated || 0) / evalTotal) * 100) : 0;
  const pendingPct = evalTotal ? Math.round(((evaluationProgress.pending || 0) / evalTotal) * 100) : 0;

  const isEmpty = !loading && !error && data &&
    !Object.keys(kpis).length &&
    !Object.values(charts).some((v) => (Array.isArray(v) ? v.length : v && Object.keys(v).length)) &&
    !Object.values(tables).some((v) => Array.isArray(v) && v.length);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col gap-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Instructor</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-700 font-medium">Analytics</span>
          </nav>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Assessment Analytics</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track submissions, scores, and evaluation progress across your assessments.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 hidden sm:inline mr-1">
                Last updated: {formatDateTime(data?.lastUpdated)}
              </span>
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExportPDF}
                disabled={!data}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileText className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={handleExportExcel}
                disabled={!data}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Assessment</label>
              <select
                value={filters.assessmentId}
                onChange={(e) => setFilters((f) => ({ ...f, assessmentId: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white"
              >
                <option value="all">All Assessments</option>
                {assessmentsLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  assessments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name || a.title}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white"
              >
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  placeholder="Student, assessment..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={handleApplyFilters}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-24" />
              ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-6 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBlock key={i} className={`h-72 ${i % 2 === 0 ? 'xl:col-span-4' : 'xl:col-span-2'}`} />
              ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-64" />
              ))}
            </div>
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={handleRefresh} />
        ) : isEmpty ? (
          <EmptyState message="No analytics data available for the selected filters." />
        ) : (
          <div ref={printRef} className="space-y-6">
            <section>
              <SectionHeader title="Key Metrics" subtitle="Snapshot of overall assessment performance" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {KPI_CONFIG.map((cfg) => (
                  <StatCard
                    key={cfg.key}
                    icon={cfg.icon}
                    label={cfg.label}
                    value={kpis[cfg.key]}
                    suffix={cfg.suffix}
                    accent={cfg.accent}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader title="Performance Charts" subtitle="Visual breakdown of submissions, scores, and activity" />
              <div className="grid grid-cols-1 xl:grid-cols-6 gap-6">
                <ChartCard className="xl:col-span-4" title="Submission Trend" subtitle="Daily submissions over the selected period">
                  {charts.submissionTrend?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={charts.submissionTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                        <Line type="monotone" dataKey="submissions" stroke="#4F46E5" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmpty message="No submission data available" />
                  )}
                </ChartCard>

                <ChartCard className="xl:col-span-2" title="Pass vs Fail" subtitle="Overall outcome split">
                  {passFailData.some((d) => d.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Pie data={passFailData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                          {passFailData.map((entry, index) => (
                            <Cell key={entry.name} fill={PASS_FAIL_COLORS[index % PASS_FAIL_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmpty message="No pass/fail data available" />
                  )}
                </ChartCard>

                <ChartCard className="xl:col-span-3" title="Average Score Trend" subtitle="Mean score trend across attempts">
                  {charts.scoreTrend?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={charts.scoreTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="scoreTrendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                        <Area type="monotone" dataKey="avgScore" stroke="#4F46E5" strokeWidth={2.5} fill="url(#scoreTrendGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmpty message="No score trend data available" />
                  )}
                </ChartCard>

                <ChartCard className="xl:col-span-3" title="Score Distribution" subtitle="Number of students per score band">
                  {charts.scoreDistribution?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={charts.scoreDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                        <Bar dataKey="count" fill="#06B6D4" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmpty message="No score distribution data available" />
                  )}
                </ChartCard>

                <ChartCard className="xl:col-span-3" title="Monthly Activity" subtitle="Attempts recorded per month">
                  {charts.monthlyActivity?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={charts.monthlyActivity} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                        <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmpty message="No activity data available" />
                  )}
                </ChartCard>

                <ChartCard className="xl:col-span-3" title="Question Difficulty Distribution" subtitle="Questions grouped by difficulty level">
                  {charts.questionDifficulty?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={charts.questionDifficulty} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="difficulty" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} width={80} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                          {charts.questionDifficulty.map((entry, index) => (
                            <Cell key={entry.difficulty} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ChartEmpty message="No difficulty data available" />
                  )}
                </ChartCard>

                <ChartCard className="xl:col-span-3" title="Completion Rate" subtitle="Share of students who completed the assessment">
                  {completionPercentage !== null ? (
                    <div className="relative h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          innerRadius="70%"
                          outerRadius="100%"
                          data={[{ name: 'Completion', value: completionPercentage, fill: '#4F46E5' }]}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                          <RadialBar background dataKey="value" cornerRadius={12} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-semibold text-gray-900">{completionPercentage}%</span>
                        <span className="text-xs text-gray-500">Completed</span>
                      </div>
                    </div>
                  ) : (
                    <ChartEmpty message="No completion rate data available" />
                  )}
                </ChartCard>

                <ChartCard className="xl:col-span-3" title="Evaluation Progress" subtitle="AI vs manual evaluation completion">
                  {evalTotal ? (
                    <div className="h-full flex flex-col justify-center gap-5 px-1">
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                          <span className="font-medium">Evaluated</span>
                          <span>{evaluationProgress.evaluated || 0} / {evalTotal} ({evaluatedPct}%)</span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${evaluatedPct}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                          <span className="font-medium">Pending</span>
                          <span>{evaluationProgress.pending || 0} / {evalTotal} ({pendingPct}%)</span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pendingPct}%` }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ChartEmpty message="No evaluation progress data available" />
                  )}
                </ChartCard>
              </div>
            </section>

            <section>
              <SectionHeader title="Detailed Reports" subtitle="Question, student, and assessment level breakdowns" />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <DataTable
                  title="Question-wise Analytics"
                  columns={QUESTION_COLUMNS}
                  rows={tables.questionAnalytics || []}
                  emptyMessage="No question analytics available"
                />
                <DataTable
                  title="Top Performing Students"
                  columns={TOP_STUDENTS_COLUMNS}
                  rows={tables.topStudents || []}
                  emptyMessage="No top performer data available"
                />
                <DataTable
                  title="Students Needing Attention"
                  columns={STRUGGLING_STUDENTS_COLUMNS}
                  rows={tables.strugglingStudents || []}
                  emptyMessage="No at-risk students found"
                />
                <DataTable
                  title="Assessment Summary"
                  columns={ASSESSMENT_SUMMARY_COLUMNS}
                  rows={tables.assessmentSummary || []}
                  emptyMessage="No assessment summary available"
                />
              </div>
            </section>

            <section>
              <SectionHeader title="AI Evaluation Insights" subtitle="Accuracy and confidence of automated grading" />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {AI_METRIC_CONFIG.map((cfg) => (
                  <AiMetricCard
                    key={cfg.key}
                    icon={cfg.icon}
                    label={cfg.label}
                    value={ai[cfg.key]}
                    suffix={cfg.suffix}
                    accent={cfg.accent}
                    showBar={cfg.showBar}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader title="Smart Insights" subtitle="Automated observations and recommendations" />
              {insights.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {insights.map((insight, idx) => (
                    <InsightCard key={insight.id ?? idx} type={insight.type} title={insight.title} message={insight.message} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <EmptyState message="No insights available for the current filters" />
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

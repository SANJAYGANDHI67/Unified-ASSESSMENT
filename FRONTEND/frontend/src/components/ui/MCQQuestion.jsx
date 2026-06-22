export default function MCQQuestion({ question }) {
  if (!question || !question.options) return null;

  function parseOptions(optionsRaw) {
    if (!optionsRaw) return [];
    if (Array.isArray(optionsRaw)) {
      return optionsRaw.map((o, idx) => ({
        value: String.fromCharCode(65 + idx),
        label: String(o).trim(),
      }));
    }

    try {
      const parsed = JSON.parse(optionsRaw);
      if (Array.isArray(parsed)) {
        return parsed.map((o, idx) => ({
          value: String.fromCharCode(65 + idx),
          label: String(o).trim(),
        }));
      }
    } catch (e) {
      // not JSON
    }

    const lines = String(optionsRaw)
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    return lines.map((line, idx) => {
      const m = line.match(/^\s*([A-D])\s*[\.\)]\s*(.+)$/i);
      if (m) return { value: m[1].toUpperCase(), label: m[2].trim() };
      return { value: String.fromCharCode(65 + idx), label: line };
    });
  }

  const opts = parseOptions(question.options);

  return (
    <div className="mt-2 space-y-1">
      {opts.map((opt, index) => (
        <div
          key={index}
          className="text-sm pl-2 border-l-2 border-gray-300"
        >
          {`${opt.value}. ${opt.label}`}
        </div>
      ))}
    </div>
  );
}
import React from "react";

export default function StatCard({
  title,
  value,
  highlight,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        p-5
        rounded-xl
        shadow-sm
        bg-white
        border
        transition
        cursor-pointer
        hover:shadow-md
        ${
          highlight === "danger"
            ? "border-l-4 border-red-500"
            : highlight === "success"
            ? "border-l-4 border-green-500"
            : "border-l-4 border-transparent"
        }
      `}
    >
      {/* TITLE */}
      <p className="text-sm text-gray-500 font-medium">
        {title}
      </p>

      {/* VALUE */}
      <p className="mt-2 text-3xl font-bold text-gray-800">
        {value}
      </p>
    </div>
  );
}
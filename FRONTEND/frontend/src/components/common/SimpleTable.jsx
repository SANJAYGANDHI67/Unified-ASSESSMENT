import React from 'react'
import { Card } from '../ui/card'

export function SimpleTable({ columns, rows }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative w-full overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/60">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2 align-top">
                    {typeof col.render === 'function'
                      ? col.render(row)
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
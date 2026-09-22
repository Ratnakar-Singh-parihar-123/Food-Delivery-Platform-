export default function DataTable({ columns, data, renderRow }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-left text-gray-500 uppercase bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-2 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{data.map(renderRow)}</tbody>
      </table>
    </div>
  );
}

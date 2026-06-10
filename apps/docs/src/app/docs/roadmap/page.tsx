export default function RoadmapPage() {
  return (
    <>
      <h1>Roadmap</h1>
      <p>DataCanvas is built in deliberate, small steps. The current focus is v0.1.</p>
      <table>
        <thead>
          <tr>
            <th>Version</th>
            <th>Scope</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>v0.1</td>
            <td>Entity metadata, CRUD API, React EntityScreen, lookup fields</td>
          </tr>
          <tr>
            <td>v0.2</td>
            <td>Master/detail screens, batch updates</td>
          </tr>
          <tr>
            <td>v0.3</td>
            <td>Permissions, audit log</td>
          </tr>
          <tr>
            <td>v0.4</td>
            <td>Import/export CSV</td>
          </tr>
          <tr>
            <td>v0.5</td>
            <td>Custom actions</td>
          </tr>
          <tr>
            <td>v0.6</td>
            <td>Visual screen designer</td>
          </tr>
          <tr>
            <td>v1.0</td>
            <td>DataCanvas Studio</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

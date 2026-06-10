import { CodeBlock } from "@/components/CodeBlock";

export default function ReactPage() {
  return (
    <>
      <h1>React components</h1>
      <p>
        <code>@data-canvas/react</code> is layered: data hooks at the bottom, presentational
        components in the middle, and the batteries-included <code>EntityScreen</code> on top. Use
        the highest layer that fits — and drop down when you need custom UI.
      </p>

      <h2>DataCanvasProvider</h2>
      <CodeBlock>{`<DataCanvasProvider baseUrl="/api/datacanvas">
  <EntityScreen entity={Customer} />
</DataCanvasProvider>`}</CodeBlock>
      <p>
        Creates the API client and a TanStack Query client. Pass your own <code>queryClient</code>{" "}
        if your app already uses TanStack Query.
      </p>

      <h2>EntityScreen</h2>
      <p>
        A complete CRUD screen: toolbar with search and a “New” button, sortable paginated grid,
        modal create/edit forms, and delete confirmation.
      </p>
      <CodeBlock>{`<EntityScreen
  entity={OrderItem}
  title="Items"                       // optional, defaults to the entity title
  pageSize={10}
  filter={{ orderId: selected.id }}   // static filters (master/detail)
  initialValues={{ orderId: selected.id }} // defaults for new records
  onRowClick={setSelected}            // enables row selection
  selectedId={selected?.id}
/>`}</CodeBlock>

      <h2>EntityGrid, EntityForm, EntityLookup</h2>
      <p>
        The building blocks behind <code>EntityScreen</code>. All of them are controlled components
        driven by entity metadata, so you can compose your own screens:
      </p>
      <CodeBlock>{`const list = useEntityList(Customer, { page, pageSize: 20, search });
const { create, update, remove } = useEntityMutations(Customer);

<EntityGrid
  entity={Customer}
  rows={list.data?.data ?? []}
  total={list.data?.total ?? 0}
  page={page}
  pageSize={20}
  sortBy={sortBy}
  sortDir={sortDir}
  onSort={handleSort}
  onPageChange={setPage}
  onEdit={openEditDialog}
/>`}</CodeBlock>

      <h2>Hooks</h2>
      <table>
        <thead>
          <tr>
            <th>Hook</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>useEntityList(entity, query)</code>
            </td>
            <td>Paginated list with sorting, search and filters</td>
          </tr>
          <tr>
            <td>
              <code>useEntityMutations(entity)</code>
            </td>
            <td>create / update / remove mutations with cache invalidation</td>
          </tr>
          <tr>
            <td>
              <code>useLookupOptions(field)</code>
            </td>
            <td>Options for a lookup field, cached per target entity</td>
          </tr>
          <tr>
            <td>
              <code>useDataCanvas()</code>
            </td>
            <td>The raw API client, for anything else</td>
          </tr>
        </tbody>
      </table>

      <h2>Styling</h2>
      <p>
        Import <code>@data-canvas/react/styles.css</code> for the default theme. Everything is
        scoped to <code>dc-*</code> classes and driven by CSS variables (<code>--dc-accent</code>,{" "}
        <code>--dc-border</code>, …), so you can re-theme with a few overrides or replace the
        stylesheet entirely.
      </p>
    </>
  );
}

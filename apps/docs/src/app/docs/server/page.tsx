import { CodeBlock } from "@/components/CodeBlock";

export default function ServerPage() {
  return (
    <>
      <h1>Server &amp; API</h1>
      <p>
        <code>createDataCanvas()</code> produces a single fetch-style handler that serves CRUD
        endpoints for every registered entity. It is framework-agnostic — anything that speaks
        web-standard <code>Request</code>/<code>Response</code> can mount it.
      </p>

      <h2>Endpoints</h2>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Path</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>GET</td>
            <td>
              <code>/:entity</code>
            </td>
            <td>List with pagination, sorting, search and filters</td>
          </tr>
          <tr>
            <td>GET</td>
            <td>
              <code>/:entity/:id</code>
            </td>
            <td>Read a single record</td>
          </tr>
          <tr>
            <td>POST</td>
            <td>
              <code>/:entity</code>
            </td>
            <td>Create (validated with the insert schema)</td>
          </tr>
          <tr>
            <td>PATCH</td>
            <td>
              <code>/:entity/:id</code>
            </td>
            <td>Partial update (validated with the update schema)</td>
          </tr>
          <tr>
            <td>DELETE</td>
            <td>
              <code>/:entity/:id</code>
            </td>
            <td>Delete</td>
          </tr>
        </tbody>
      </table>

      <h2>List query parameters</h2>
      <CodeBlock>{`GET /api/datacanvas/customers
    ?page=1
    &pageSize=20
    &sortBy=name
    &sortDir=desc
    &search=ada              // matches text + email fields, case-insensitive
    &filter.countryId=<uuid> // equality filter, any field`}</CodeBlock>
      <p>
        Unknown sort or filter fields are silently dropped, so clients can never reach raw column
        names. Page size is capped at 100.
      </p>

      <h2>Responses</h2>
      <CodeBlock>{`// list
{ "data": [...], "page": 1, "pageSize": 20, "total": 42 }

// single record
{ "data": { ... } }

// validation error (400)
{ "error": { "message": "Validation failed.", "issues": [/* zod issues */] } }`}</CodeBlock>

      <h2>Mounting</h2>
      <p>
        The handler locates the entity segment anywhere in the URL path, so it works under any base
        path without configuration. In Next.js, use an optional catch-all route:
      </p>
      <CodeBlock>{`// app/api/datacanvas/[[...path]]/route.ts
import { app } from "@/lib/datacanvas";

export const GET = app.handlers.GET;
export const POST = app.handlers.POST;
export const PATCH = app.handlers.PATCH;
export const DELETE = app.handlers.DELETE;`}</CodeBlock>
    </>
  );
}

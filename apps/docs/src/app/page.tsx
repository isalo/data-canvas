import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";

export default function LandingPage() {
  return (
    <>
      <section className="hero">
        <h1>Define entities once.{"\n"}Get the whole CRUD stack.</h1>
        <p className="tagline">
          DataCanvas brings Delphi-style data components to modern TypeScript web apps: entities in,
          APIs + grids + forms + validation + PostgreSQL out.
        </p>
        <div className="hero-actions">
          <Link className="btn btn-primary" href="/docs/getting-started">
            Get started
          </Link>
          <a className="btn" href="https://github.com/isalo/datacanvas">
            View on GitHub
          </a>
        </div>
        <div className="hero-code">
          <CodeBlock>{`export const Customer = entity("customers", {
  id: field.uuid().primary(),
  name: field.text().required(),
  email: field.email(),
  countryId: field.lookup(Country, { label: "name" }),
});

export default function CustomersPage() {
  return <EntityScreen entity={Customer} />;
}`}</CodeBlock>
        </div>
      </section>

      <section className="features">
        <div className="feature">
          <h3>Metadata-first</h3>
          <p>
            One entity definition drives the API, validation, database tables, grids, forms and
            lookups. No code generation, no duplication.
          </p>
        </div>
        <div className="feature">
          <h3>Full CRUD out of the box</h3>
          <p>
            Pagination, sorting, free-text search, equality filters, create/edit modals and delete
            confirmation — included by default.
          </p>
        </div>
        <div className="feature">
          <h3>No magic, no lock-in</h3>
          <p>
            Headless hooks and a documented adapter contract. Swap the UI, the database or the whole
            HTTP layer without rewriting your entities.
          </p>
        </div>
        <div className="feature">
          <h3>PostgreSQL via Drizzle</h3>
          <p>
            The Drizzle adapter derives tables from your entities. An in-memory adapter ships for
            tests and zero-setup demos.
          </p>
        </div>
        <div className="feature">
          <h3>Type-safe</h3>
          <p>
            Field builders carry types end to end: <code>InferRow&lt;typeof Customer&gt;</code>{" "}
            gives you the row type for free.
          </p>
        </div>
        <div className="feature">
          <h3>Zod validation</h3>
          <p>
            Insert and update schemas are generated per entity and enforced on both the client form
            and the server handler.
          </p>
        </div>
      </section>
    </>
  );
}

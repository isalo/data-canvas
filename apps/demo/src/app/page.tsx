import Link from "next/link";

export default function HomePage() {
  return (
    <div className="home">
      <h1>DataCanvas Demo</h1>
      <p>
        Every screen in this demo is a single <code>&lt;EntityScreen /&gt;</code> component. The
        grid, form, validation, lookups, search, sorting, pagination and the API behind them are all
        generated from entity metadata.
      </p>

      <div className="home-cards">
        <Link href="/customers" className="home-card">
          <h3>Customers</h3>
          <p>CRUD screen with an email field, a boolean flag and a Country lookup.</p>
        </Link>
        <Link href="/countries" className="home-card">
          <h3>Countries</h3>
          <p>The simplest possible entity — two text fields and a generated API.</p>
        </Link>
        <Link href="/orders" className="home-card">
          <h3>Orders</h3>
          <p>Master/detail: select an order to manage its order items.</p>
        </Link>
      </div>

      <pre className="home-code">{`export const Customer = entity("customers", {
  id: field.uuid().primary(),
  name: field.text().required(),
  email: field.email().required(),
  countryId: field.lookup(Country, { label: "name" }),
});

export default function CustomersPage() {
  return <EntityScreen entity={Customer} />;
}`}</pre>
    </div>
  );
}

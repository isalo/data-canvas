export default function ScreenshotsPage() {
  return (
    <>
      <h1>Screenshots</h1>
      <p>
        Placeholders below will be replaced with real captures of the demo app. Run the demo locally
        with <code>pnpm dev</code> to see the live version.
      </p>

      <h2>Customers — generated CRUD screen</h2>
      <img
        className="screenshot"
        src="/screenshots/customers-screen.svg"
        alt="Customers EntityScreen with grid, search and create button"
      />

      <h2>Orders — master/detail</h2>
      <img
        className="screenshot"
        src="/screenshots/orders-master-detail.svg"
        alt="Orders master grid with order items detail screen"
      />
    </>
  );
}

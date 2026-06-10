-- DataCanvas demo schema + seed data.
-- Loaded automatically by the postgres container on first start
-- (see docker-compose.yml). Column names are snake_case versions of
-- the camelCase field names defined in apps/demo/src/lib/entities.ts.

create table if not exists countries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  active boolean,
  country_id uuid references countries (id) on delete set null
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null,
  customer_id uuid not null references customers (id),
  order_date date not null,
  total double precision not null
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product text not null,
  quantity double precision not null,
  unit_price double precision not null
);

insert into countries (id, name, code) values
  ('00000000-0000-4000-8000-000000000001', 'United States', 'US'),
  ('00000000-0000-4000-8000-000000000002', 'United Kingdom', 'GB'),
  ('00000000-0000-4000-8000-000000000003', 'Germany', 'DE'),
  ('00000000-0000-4000-8000-000000000004', 'France', 'FR'),
  ('00000000-0000-4000-8000-000000000005', 'Japan', 'JP')
on conflict do nothing;

insert into customers (id, name, email, active, country_id) values
  ('00000000-0000-4000-8000-000000000101', 'Ada Lovelace', 'ada@example.com', true, '00000000-0000-4000-8000-000000000002'),
  ('00000000-0000-4000-8000-000000000102', 'Grace Hopper', 'grace@example.com', true, '00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000103', 'Alan Turing', 'alan@example.com', false, '00000000-0000-4000-8000-000000000002'),
  ('00000000-0000-4000-8000-000000000104', 'Konrad Zuse', 'konrad@example.com', true, '00000000-0000-4000-8000-000000000003')
on conflict do nothing;

insert into orders (id, reference, customer_id, order_date, total) values
  ('00000000-0000-4000-8000-000000000201', 'ORD-1001', '00000000-0000-4000-8000-000000000101', '2026-01-15', 1250),
  ('00000000-0000-4000-8000-000000000202', 'ORD-1002', '00000000-0000-4000-8000-000000000102', '2026-02-03', 480.5),
  ('00000000-0000-4000-8000-000000000203', 'ORD-1003', '00000000-0000-4000-8000-000000000104', '2026-03-21', 99.99)
on conflict do nothing;

insert into order_items (id, order_id, product, quantity, unit_price) values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000201', 'Analytical Engine', 1, 1000),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000201', 'Punch Cards (box)', 5, 50),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000202', 'Compiler Manual', 2, 40.25),
  ('00000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000202', 'Debugging Kit', 1, 400),
  ('00000000-0000-4000-8000-000000000305', '00000000-0000-4000-8000-000000000203', 'Enigma Replica', 1, 99.99)
on conflict do nothing;

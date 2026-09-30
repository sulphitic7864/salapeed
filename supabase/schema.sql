create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_email text,
  customer_phone text not null,
  customer_address text not null,
  payment_method text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12, 3) not null,
  delivery_fee numeric(12, 3) not null,
  total numeric(12, 3) not null,
  status text not null,
  status_history jsonb not null default '[]'::jsonb,
  customer_notes text
);

create index if not exists orders_created_at_desc_idx
  on public.orders (created_at desc);

create table if not exists public.graphics (
  id text primary key,
  name text not null,
  category text not null,
  tags jsonb not null default '[]'::jsonb,
  svg_content text,
  preview_url text,
  print_ready_url text,
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.graphic_categories (
  name text primary key,
  created_at timestamptz not null default now()
);

alter table public.graphics
  add column if not exists tags jsonb not null default '[]'::jsonb;

create table if not exists public.products (
  id text primary key,
  name text not null,
  brochure_title text,
  description text not null,
  kind text not null,
  base_price numeric(12, 3) not null default 0,
  colors jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  image_type text not null default 'pullover',
  size_chart jsonb not null default '{"headers":[],"rows":[]}'::jsonb,
  photo_url text,
  color_photos jsonb not null default '{}'::jsonb,
  brochure_page integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id text primary key,
  q text not null,
  a text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_config (
  id text primary key default 'main',
  print_fee numeric(12, 3) not null default 0,
  delivery_fee numeric(12, 3) not null default 0,
  shop_phone text not null default '',
  shop_address text not null default '',
  shop_email text not null default '',
  benefit_iban text not null default '',
  benefit_phone text not null default '',
  website text,
  instagram text,
  slogan_en text,
  brand_name_en text,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.graphics enable row level security;
alter table public.graphic_categories enable row level security;
alter table public.products enable row level security;
alter table public.faqs enable row level security;
alter table public.admin_config enable row level security;
alter table public.admin_users enable row level security;

revoke all on table public.orders, public.graphics, public.graphic_categories, public.products, public.faqs, public.admin_config, public.admin_users from anon, authenticated;

grant select on table public.products, public.faqs, public.admin_config, public.graphic_categories to anon, authenticated;
grant all on table public.orders, public.graphics, public.graphic_categories, public.products, public.faqs, public.admin_config, public.admin_users to service_role;
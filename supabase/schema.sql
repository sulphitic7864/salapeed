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

insert into public.products (
  id,
  name,
  brochure_title,
  description,
  kind,
  base_price,
  colors,
  sizes,
  image_type,
  size_chart,
  brochure_page
)
values
  (
    'kids-hoodie',
    'Kids Hoodies',
    'KIDS HOODIES (PULLOVER)',
    'Cozy, durable 380 GSM kids fleece pullover hoodie for ages 2 to 12 years with classic kangaroo pouch pocket, no zippers, and reinforced double-needle seams.',
    'kids',
    7.5,
    '["Black", "Red", "Heather Grey", "Navy", "Charcoal", "White"]'::jsonb,
    '["2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years", "10–11 Years", "12 Years"]'::jsonb,
    'kids',
    '{"headers":["Age Group","Chest (cm)","Length (cm)"],"rows":[{"size":"2–3 Years","cells":["34–36","42–44"]},{"size":"4–5 Years","cells":["37–39","46–48"]},{"size":"6–7 Years","cells":["40–42","50–52"]},{"size":"8–9 Years","cells":["43–45","54–56"]},{"size":"10–11 Years","cells":["46–48","58–60"]},{"size":"12 Years","cells":["49–51","62–64"]}]}'::jsonb,
    7
  ),
  (
    'fleece-hoodie',
    'Adults Fleece Hoodie',
    'ADULTS FLEECE HOODIE (PULLOVER)',
    'Classic street pullover hoodie with kangaroo pouch pocket, double-layer drawstring hood, and 380 GSM brushed fleece warmth.',
    'adult',
    9.5,
    '["Black", "Red", "Heather Grey", "Navy", "Charcoal", "White"]'::jsonb,
    '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb,
    'pullover',
    '{"headers":["Size","Shoulder (cm)","Chest (cm)","Length (cm)"],"rows":[{"size":"XS","cells":["42","48","62"]},{"size":"S","cells":["44","50","64"]},{"size":"M","cells":["46","54","68"]},{"size":"L","cells":["50","58","70"]},{"size":"XL","cells":["52","60","72"]},{"size":"XXL","cells":["56","64","76"]}]}'::jsonb,
    3
  ),
  (
    'zipper-hoodie',
    'Adult Zip Hoodie',
    'ADULT ZIP HOODIE',
    'Heavyweight 380 GSM full-zip fleece hoodie with dual split kangaroo pockets, double-lined hood, and smooth metallic front zipper.',
    'adult',
    11.5,
    '["Black", "Navy", "Heather Grey", "Red", "Charcoal", "White"]'::jsonb,
    '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb,
    'zipper',
    '{"headers":["Size","Shoulder (cm)","Chest (cm)","Length (cm)"],"rows":[{"size":"XS","cells":["42","48","62"]},{"size":"S","cells":["44","50","64"]},{"size":"M","cells":["46","54","68"]},{"size":"L","cells":["50","58","70"]},{"size":"XL","cells":["52","60","72"]},{"size":"XXL","cells":["56","64","76"]}]}'::jsonb,
    1
  )
on conflict (id) do nothing;

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
  benefit_qr_url text,
  website text,
  instagram text,
  slogan_en text,
  brand_name_en text,
  updated_at timestamptz not null default now()
);

alter table public.admin_config
  add column if not exists benefit_qr_url text;

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
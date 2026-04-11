-- Migration: 2026-04-11 — showcase redesign foundation
-- Adds testimonials table, properties.cover_photo_id, and new website_settings keys.

-- 1. testimonials table
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  review_text text not null,
  rating int not null default 5 check (rating between 1 and 5),
  source text not null check (source in ('airbnb','facebook','google','direct')),
  stay_month text,
  property_id uuid references properties(id) on delete set null,
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists testimonials_published_order_idx
  on testimonials (published, display_order);

create index if not exists testimonials_property_id_idx
  on testimonials (property_id);

-- 2. properties.cover_photo_id column
alter table properties
  add column if not exists cover_photo_id uuid
  references property_photos(id) on delete set null;

-- 3. website_settings: insert placeholder rows for new keys (upsert pattern)
insert into website_settings (setting_key, setting_value)
values
  ('hero_photo_url', ''),
  ('intro_title',    'Cozy Condo is a small family-run collection of rentals across Iloilo City.'),
  ('intro_body',     'We handpick every unit, furnish it ourselves, and respond to every guest message personally — because hospitality, to us, means being reachable.')
on conflict (setting_key) do nothing;

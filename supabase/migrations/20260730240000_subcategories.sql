alter table categories add column if not exists parent_id uuid references categories(id) on delete cascade;
create index if not exists idx_categories_parent on categories(parent_id);

grant select on categories to anon, authenticated;

-- تصنيفات فرعية نصية لكل تصنيف رئيسي
do $$
declare
  cat_id uuid;
begin
  select id into cat_id from categories where slug = 'halls';
  insert into categories (name, slug, parent_id, sort_order) values
    ('قصور أفراح', 'halls-palaces', cat_id, 1),
    ('استراحات', 'halls-chalets', cat_id, 2),
    ('فلل مناسبات', 'halls-villas', cat_id, 3),
    ('فنادق', 'halls-hotels', cat_id, 4),
    ('خيام ملكية', 'halls-tents', cat_id, 5)
  on conflict (slug) do nothing;

  select id into cat_id from categories where slug = 'planning';
  insert into categories (name, slug, parent_id, sort_order) values
    ('منسق مناسبات', 'planning-wedding-planner', cat_id, 1),
    ('تنظيم حفلات', 'planning-events', cat_id, 2),
    ('إدارة يوم الحفل', 'planning-day-of', cat_id, 3)
  on conflict (slug) do nothing;

  select id into cat_id from categories where slug = 'photography';
  insert into categories (name, slug, parent_id, sort_order) values
    ('تصوير فوتوغرافي', 'photography-photo', cat_id, 1),
    ('تصوير فيديو', 'photography-video', cat_id, 2),
    ('تصوير درون', 'photography-drone', cat_id, 3),
    ('بوث تصوير 360', 'photography-booth', cat_id, 4),
    ('ألبومات صور', 'photography-albums', cat_id, 5)
  on conflict (slug) do nothing;

  select id into cat_id from categories where slug = 'catering';
  insert into categories (name, slug, parent_id, sort_order) values
    ('كاترينج وبوفيهات', 'catering-buffet', cat_id, 1),
    ('قهوجية وصبابات', 'catering-coffee', cat_id, 2),
    ('شيف متنقل', 'catering-chef', cat_id, 3),
    ('كاندي بار', 'catering-candy', cat_id, 4)
  on conflict (slug) do nothing;

  select id into cat_id from categories where slug = 'decoration';
  insert into categories (name, slug, parent_id, sort_order) values
    ('تنسيق طاولات', 'decoration-tables', cat_id, 1),
    ('إضاءة وليزر', 'decoration-lighting', cat_id, 2),
    ('شاشات LED', 'decoration-screens', cat_id, 3),
    ('خيام ومظلات', 'decoration-tents', cat_id, 4)
  on conflict (slug) do nothing;

  select id into cat_id from categories where slug = 'flowers';
  insert into categories (name, slug, parent_id, sort_order) values
    ('بوكيهات ورد', 'flowers-bouquet', cat_id, 1),
    ('تنسيق زهور', 'flowers-arrangement', cat_id, 2),
    ('هدايا مناسبات', 'flowers-gifts', cat_id, 3)
  on conflict (slug) do nothing;

  select id into cat_id from categories where slug = 'weddings';
  insert into categories (name, slug, parent_id, sort_order) values
    ('كوش أعراس', 'weddings-kosha', cat_id, 1),
    ('جلسات شعبية', 'weddings-majlis', cat_id, 2),
    ('توزيعات أعراس', 'weddings-favors', cat_id, 3)
  on conflict (slug) do nothing;

  select id into cat_id from categories where slug = 'sound-light';
  insert into categories (name, slug, parent_id, sort_order) values
    ('دي جي', 'sound-dj', cat_id, 1),
    ('أنظمة صوت', 'sound-systems', cat_id, 2),
    ('إضاءة مسرحية', 'sound-stage-light', cat_id, 3)
  on conflict (slug) do nothing;

  select id into cat_id from categories where slug = 'fashion';
  insert into categories (name, slug, parent_id, sort_order) values
    ('عبايات وأزياء', 'fashion-abaya', cat_id, 1),
    ('بدلات عرسان', 'fashion-suits', cat_id, 2),
    ('خياطة مخصصة', 'fashion-tailoring', cat_id, 3)
  on conflict (slug) do nothing;

  select id into cat_id from categories where slug = 'invitations';
  insert into categories (name, slug, parent_id, sort_order) values
    ('دعوات إلكترونية', 'invitations-digital', cat_id, 1),
    ('دعوات ورقية', 'invitations-paper', cat_id, 2),
    ('بطاقات شكر', 'invitations-thankyou', cat_id, 3),
    ('بطاقات فيديو', 'invitations-video-cards', cat_id, 4)
  on conflict (slug) do nothing;

  select id into cat_id from categories where slug = 'sweets';
  insert into categories (name, slug, parent_id, sort_order) values
    ('كيك المناسبات', 'sweets-cake', cat_id, 1),
    ('حلويات فاخرة', 'sweets-premium', cat_id, 2),
    ('بوفيه حلا', 'sweets-buffet', cat_id, 3)
  on conflict (slug) do nothing;

  select id into cat_id from categories where slug = 'supplies';
  insert into categories (name, slug, parent_id, sort_order) values
    ('توزيعات وهدايا', 'supplies-favors', cat_id, 1),
    ('بالونات', 'supplies-balloons', cat_id, 2),
    ('مستلزمات تنسيق', 'supplies-decor-tools', cat_id, 3)
  on conflict (slug) do nothing;

  select id into cat_id from categories where slug = 'kids-entertainment';
  insert into categories (name, slug, parent_id, sort_order) values
    ('ألعاب أطفال', 'kids-games', cat_id, 1),
    ('مهرج ورسام', 'kids-clown', cat_id, 2),
    ('عروض ترفيهية', 'kids-shows', cat_id, 3)
  on conflict (slug) do nothing;
end $$;

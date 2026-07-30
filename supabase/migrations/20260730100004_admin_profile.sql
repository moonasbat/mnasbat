-- إنشاء profile لحساب Super Admin الأول (auth.users.id معروف مسبقاً)
insert into profiles (id, display_name, role)
values ('ad4459c0-11d4-47c7-9901-0d899be22f01', 'مالك المنصة', 'super_admin')
on conflict (id) do update set role = 'super_admin';

-- ترقية المستخدم الذي سجّل عبر Google إلى مالك المنصة (super_admin)
update profiles
set role = 'super_admin'
where id = '0768fb19-4b06-4b0a-a0fb-6bac808b54ed';

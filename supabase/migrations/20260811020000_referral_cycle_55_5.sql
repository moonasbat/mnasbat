-- تحويل برنامج الإحالة من دورة شهرية (تقويمية) إلى دورة ثابتة: ٥٥ يوم سباق + ٥ أيام استراحة،
-- تتكرر باستمرار بدون ارتباط بأول الشهر الميلادي

insert into admin_settings (key, value, label) values
  ('referral_cycle_anchor', to_char(now(), 'YYYY-MM-DD'), 'تاريخ بداية أول سباق إحالة (٥٥ يوم سباق + ٥ أيام استراحة)')
on conflict (key) do nothing;

update notification_templates
set title = '🏆 فزت بجائزة الإحالة!',
    body = 'دعوت {count} شخص بآخر سباق وحصلت على المركز {rank}! جائزتك {prize} ر.س، بيتواصل معك فريق مناسبات لتسليمها.'
where key = 'REFERRAL_MONTHLY_WINNER';

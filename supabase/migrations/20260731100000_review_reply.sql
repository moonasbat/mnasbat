alter table reviews add column reply text;
alter table reviews add column replied_at timestamptz;

create policy "reviewee reply to review" on reviews for update using (auth.uid() = reviewee_id) with check (auth.uid() = reviewee_id);

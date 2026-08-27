create policy "Tutors manage own learning files" on storage.objects for all to authenticated
using (
  bucket_id = 'learning-resources'
  and public.owns_tutor(nullif((storage.foldername(name))[1], '')::uuid)
)
with check (
  bucket_id = 'learning-resources'
  and public.owns_tutor(nullif((storage.foldername(name))[1], '')::uuid)
);

create policy "Families read shared learning files" on storage.objects for select to authenticated
using (
  bucket_id = 'learning-resources'
  and exists (
    select 1 from public.learning_resources lr
    where lr.storage_path = storage.objects.name
      and lr.is_shared and lr.student_id is not null
      and public.can_access_student(lr.student_id)
  )
);

create policy "Families upload submissions" on storage.objects for insert to authenticated
with check (
  bucket_id = 'learning-resources'
  and (storage.foldername(name))[1] = 'submissions'
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "Families read own submissions" on storage.objects for select to authenticated
using (
  bucket_id = 'learning-resources'
  and (storage.foldername(name))[1] = 'submissions'
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "Tutors read submissions for their assignments" on storage.objects for select to authenticated
using (
  bucket_id = 'learning-resources'
  and exists (
    select 1 from public.assignments a
    where a.submission_path = storage.objects.name and public.owns_tutor(a.tutor_id)
  )
);

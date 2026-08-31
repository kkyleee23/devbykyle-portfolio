-- Recommendation review cards: add a 1-5 star rating.
-- Run once in the Supabase SQL editor (project: portfolio).
-- Safe to run more than once (add column if not exists).

alter table public.recommendations
  add column if not exists rating smallint;

alter table public.recommendations
  drop constraint if exists recommendations_rating_check;

alter table public.recommendations
  add constraint recommendations_rating_check
  check (rating is null or (rating between 1 and 5));

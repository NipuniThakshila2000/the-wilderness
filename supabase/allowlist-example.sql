insert into members_allowlist (email, active)
values ('nipunithakshilagunasinghe28@gmail.com', true)
on conflict (email)
do update set active = excluded.active;

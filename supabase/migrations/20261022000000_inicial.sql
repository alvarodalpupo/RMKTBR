-- =====================================================================
-- RaceMarketBR — banco de dados inicial (Supabase / PostgreSQL)
--
-- Como usar: no painel do Supabase abra "SQL Editor", cole este arquivo
-- inteiro e clique em "Run". Pode rodar de novo sem quebrar nada.
--
-- Regras de segurança (Row Level Security):
--   * Visitantes veem só anúncios publicados ou vendidos.
--   * Qualquer pessoa pode enviar anúncio (entra "em revisão") e mensagem
--     de contato; só o admin aprova, publica e lê as mensagens.
--   * Cada usuário vê e edita os próprios anúncios, perfil e notificações.
--   * Só o admin muda papel, status de conta, destaque e status do anúncio.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Perfis (1 por usuário do Supabase Auth)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  nome          text not null default '',
  email         text not null default '',
  role          text not null default 'user'  check (role in ('user', 'admin')),
  status        text not null default 'ativo' check (status in ('ativo', 'banido', 'suspenso')),
  suspended_until timestamptz,
  status_reason text,
  verified      boolean not null default false,
  telefone      text,
  cidade        text,
  uf            text check (uf is null or char_length(uf) = 2),
  avatar_url    text,
  biografia     text,
  preferencias  jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  last_login    timestamptz
);

-- Admin? (security definer evita recursão nas políticas de profiles)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'ativo'
  );
$$;

-- Pode mudar campos protegidos? Admin logado, ou o próprio painel do
-- Supabase / SQL Editor (que não roda como visitante nem como usuário).
create or replace function public.is_privileged()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
      or coalesce(nullif(current_setting('role', true), ''), 'none')
         not in ('anon', 'authenticated');
$$;

-- Conta pode publicar? Visitante sim; usuário banido não; suspenso só depois do prazo.
create or replace function public.conta_ativa()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is null or exists (
    select 1 from public.profiles
    where id = auth.uid()
      and (status = 'ativo' or (status = 'suspenso' and suspended_until < now()))
  );
$$;

-- Cria o perfil automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nome, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'nome',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Usuário comum não pode se promover nem mudar o próprio status
create or replace function public.profiles_protect_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_privileged() then
    new.role            := old.role;
    new.status          := old.status;
    new.suspended_until := old.suspended_until;
    new.status_reason   := old.status_reason;
    new.verified        := old.verified;
    new.email           := old.email;
    new.created_at      := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect
  before update on public.profiles
  for each row execute function public.profiles_protect_fields();

alter table public.profiles enable row level security;

drop policy if exists "perfil: ver o próprio ou admin" on public.profiles;
create policy "perfil: ver o próprio ou admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "perfil: editar o próprio ou admin" on public.profiles;
create policy "perfil: editar o próprio ou admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "perfil: admin exclui" on public.profiles;
create policy "perfil: admin exclui" on public.profiles
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------
-- Anúncios
-- ---------------------------------------------------------------------
create table if not exists public.listings (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles (id) on delete set null,
  titulo           text not null check (char_length(titulo) between 3 and 120),
  categoria        text not null check (categoria in ('turbo', 'aspirado', 'original', 'pista')),
  ano              int  not null check (ano between 1900 and 2100),
  preco            numeric(12, 2) not null check (preco > 0 and preco <= 10000000),
  cidade           text not null,
  uf               text not null check (char_length(uf) = 2),
  descricao        text check (descricao is null or char_length(descricao) <= 5000),
  telefone         text,
  destaque         boolean not null default false,
  views            int not null default 0,
  clicks_whatsapp  int not null default 0,
  power_whp        numeric(6, 1),
  torque_kgfm      numeric(6, 1),
  tracao           text check (tracao is null or tracao in ('dianteira', 'traseira', 'integral')),
  status           text not null default 'em_revisao'
                   check (status in ('em_revisao', 'publicado', 'rejeitado', 'arquivado', 'vendido')),
  aceita_troca     boolean not null default false,
  images           text[] not null default '{}' check (cardinality(images) <= 10),
  sold_at          timestamptz,
  admin_notes      text,
  rejection_reason text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists listings_status_created_idx on public.listings (status, created_at desc);
create index if not exists listings_user_idx on public.listings (user_id);
create index if not exists listings_categoria_idx on public.listings (categoria);

-- Contato de quem anunciou sem conta: só o admin vê (não fica público)
create table if not exists public.listing_contacts (
  listing_id uuid primary key references public.listings (id) on delete cascade,
  nome       text not null check (char_length(nome) between 2 and 120),
  email      text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);

-- Ao criar: força "em revisão", zera contadores e grava o dono
create or replace function public.listings_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_privileged() then
    new.status           := 'em_revisao';
    new.destaque         := false;
    new.views            := 0;
    new.clicks_whatsapp  := 0;
    new.sold_at          := null;
    new.admin_notes      := null;
    new.rejection_reason := null;
    new.user_id          := auth.uid();
  end if;
  new.created_at := now();
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists listings_insert on public.listings;
create trigger listings_insert
  before insert on public.listings
  for each row execute function public.listings_before_insert();

-- Ao editar: dono não aprova o próprio anúncio nem mexe em contadores.
-- Ele pode arquivar ou marcar como vendido; editar o texto devolve para revisão.
create or replace function public.listings_before_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Contadores de visualização/WhatsApp (funções abaixo): só os números mudam
  if current_setting('racemarket.contador', true) = 'on' then
    return new;
  end if;

  new.updated_at := now();
  if public.is_privileged() then
    if new.status = 'vendido' and old.status <> 'vendido' then
      new.sold_at := coalesce(new.sold_at, now());
    end if;
    return new;
  end if;

  new.user_id          := old.user_id;
  new.destaque         := old.destaque;
  new.views            := old.views;
  new.clicks_whatsapp  := old.clicks_whatsapp;
  new.admin_notes      := old.admin_notes;
  new.rejection_reason := old.rejection_reason;
  new.created_at       := old.created_at;

  if new.status is distinct from old.status
     and new.status not in ('arquivado', 'vendido') then
    new.status := old.status;
  end if;

  if new.status = 'vendido' and old.status <> 'vendido' then
    new.sold_at := now();
  else
    new.sold_at := old.sold_at;
  end if;

  -- Mudou o conteúdo de um anúncio publicado? Volta para revisão.
  if old.status = 'publicado' and new.status = 'publicado' and (
       new.titulo, new.categoria, new.ano, new.preco, new.cidade, new.uf,
       new.descricao, new.telefone, new.images, new.power_whp, new.torque_kgfm, new.tracao
     ) is distinct from (
       old.titulo, old.categoria, old.ano, old.preco, old.cidade, old.uf,
       old.descricao, old.telefone, old.images, old.power_whp, old.torque_kgfm, old.tracao
     ) then
    new.status := 'em_revisao';
  end if;

  return new;
end;
$$;

drop trigger if exists listings_update on public.listings;
create trigger listings_update
  before update on public.listings
  for each row execute function public.listings_before_update();

alter table public.listings enable row level security;
alter table public.listing_contacts enable row level security;

drop policy if exists "anúncio: público vê publicados e vendidos" on public.listings;
create policy "anúncio: público vê publicados e vendidos" on public.listings
  for select using (
    status in ('publicado', 'vendido')
    or user_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "anúncio: qualquer um envia para revisão" on public.listings;
create policy "anúncio: qualquer um envia para revisão" on public.listings
  for insert with check (
    public.is_admin()
    or (public.conta_ativa() and (
      (auth.uid() is null and user_id is null) or user_id = auth.uid()
    ))
  );

drop policy if exists "anúncio: dono ou admin edita" on public.listings;
create policy "anúncio: dono ou admin edita" on public.listings
  for update using (user_id = auth.uid() or public.is_admin())
  with check (public.is_admin() or (user_id = auth.uid() and public.conta_ativa()));

drop policy if exists "anúncio: dono ou admin exclui" on public.listings;
create policy "anúncio: dono ou admin exclui" on public.listings
  for delete using (user_id = auth.uid() or public.is_admin());

drop policy if exists "contato: qualquer um envia" on public.listing_contacts;
create policy "contato: qualquer um envia" on public.listing_contacts
  for insert with check (true);

drop policy if exists "contato: só admin lê" on public.listing_contacts;
create policy "contato: só admin lê" on public.listing_contacts
  for select using (public.is_admin());

drop policy if exists "contato: só admin exclui" on public.listing_contacts;
create policy "contato: só admin exclui" on public.listing_contacts
  for delete using (public.is_admin());

-- Contadores públicos (visitante não pode editar o anúncio, então usa função)
drop function if exists public.increment_listing_views(uuid);
drop function if exists public.increment_listing_whatsapp(uuid);

create or replace function public.increment_listing_views(listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('racemarket.contador', 'on', true);
  update public.listings set views = views + 1
  where id = listing_id and status = 'publicado';
  perform set_config('racemarket.contador', 'off', true);
end;
$$;

create or replace function public.increment_listing_whatsapp(listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('racemarket.contador', 'on', true);
  update public.listings set clicks_whatsapp = clicks_whatsapp + 1
  where id = listing_id and status = 'publicado';
  perform set_config('racemarket.contador', 'off', true);
end;
$$;

grant execute on function public.increment_listing_views(uuid) to anon, authenticated;
grant execute on function public.increment_listing_whatsapp(uuid) to anon, authenticated;

-- Números do usuário no painel do admin
create or replace view public.profile_stats
with (security_invoker = true) as
  select p.id,
         count(l.id)::int                    as total_listings,
         coalesce(sum(l.views), 0)::int      as total_views
  from public.profiles p
  left join public.listings l on l.user_id = p.id
  group by p.id;

-- ---------------------------------------------------------------------
-- Notificações (criadas automaticamente quando o admin muda o anúncio)
-- ---------------------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  type       text not null default 'geral'
             check (type in ('aprovacao', 'rejeicao', 'status_change', 'destaque', 'geral', 'account')),
  title      text not null,
  message    text not null,
  listing_id uuid references public.listings (id) on delete cascade,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notificação: dono vê" on public.notifications;
create policy "notificação: dono vê" on public.notifications
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notificação: dono marca como lida" on public.notifications;
create policy "notificação: dono marca como lida" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "notificação: dono exclui" on public.notifications;
create policy "notificação: dono exclui" on public.notifications
  for delete using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notificação: admin cria" on public.notifications;
create policy "notificação: admin cria" on public.notifications
  for insert with check (public.is_admin());

create or replace function public.notify_listing_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then
    return new;
  end if;

  if new.status is distinct from old.status then
    if new.status = 'publicado' then
      insert into public.notifications (user_id, type, title, message, listing_id)
      values (new.user_id, 'aprovacao', 'Anúncio aprovado',
              format('Seu anúncio "%s" foi aprovado e já está no ar.', new.titulo), new.id);
    elsif new.status = 'rejeitado' then
      insert into public.notifications (user_id, type, title, message, listing_id)
      values (new.user_id, 'rejeicao', 'Anúncio não aprovado',
              format('Seu anúncio "%s" não foi aprovado. Motivo: %s', new.titulo,
                     coalesce(new.rejection_reason, 'não informado')), new.id);
    elsif new.status = 'vendido' then
      insert into public.notifications (user_id, type, title, message, listing_id)
      values (new.user_id, 'status_change', 'Anúncio marcado como vendido',
              format('"%s" foi marcado como vendido.', new.titulo), new.id);
    end if;
  end if;

  if new.destaque and not old.destaque then
    insert into public.notifications (user_id, type, title, message, listing_id)
    values (new.user_id, 'destaque', 'Anúncio em destaque',
            format('"%s" agora aparece nos destaques da home.', new.titulo), new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists listings_notify on public.listings;
create trigger listings_notify
  after update on public.listings
  for each row execute function public.notify_listing_change();

-- ---------------------------------------------------------------------
-- Mensagens do formulário de contato
-- ---------------------------------------------------------------------
create table if not exists public.contact_messages (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 2 and 120),
  email        text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone        text,
  subject      text not null default 'outro',
  message      text not null check (char_length(message) between 5 and 5000),
  status       text not null default 'nova' check (status in ('nova', 'lida', 'respondida', 'arquivada')),
  priority     text not null default 'media' check (priority in ('baixa', 'media', 'alta')),
  read_at      timestamptz,
  response     text,
  responded_at timestamptz,
  responded_by uuid references public.profiles (id) on delete set null,
  admin_notes  text,
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now()
);

create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);

create or replace function public.contact_messages_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_privileged() then
    new.status       := 'nova';
    new.read_at      := null;
    new.response     := null;
    new.responded_at := null;
    new.responded_by := null;
    new.admin_notes  := null;
    new.tags         := '{}';
    new.priority     := case when new.subject in ('venda', 'parceria') then 'alta' else 'media' end;
  end if;
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists contact_messages_insert on public.contact_messages;
create trigger contact_messages_insert
  before insert on public.contact_messages
  for each row execute function public.contact_messages_before_insert();

alter table public.contact_messages enable row level security;

drop policy if exists "mensagem: qualquer um envia" on public.contact_messages;
create policy "mensagem: qualquer um envia" on public.contact_messages
  for insert with check (true);

drop policy if exists "mensagem: admin gerencia" on public.contact_messages;
create policy "mensagem: admin gerencia" on public.contact_messages
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Configurações do site (lidas por todos, alteradas só pelo admin)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id         int primary key default 1 check (id = 1),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.site_customization (
  id          uuid primary key default gen_random_uuid(),
  section     text not null default 'visual'
              check (section in ('visual', 'content', 'layout', 'social', 'seo', 'advanced')),
  key         text not null unique,
  value       text not null default '',
  type        text not null default 'text'
              check (type in ('color', 'image', 'text', 'boolean', 'number', 'object')),
  label       text not null default '',
  description text not null default '',
  category    text not null default 'general',
  "order"     int not null default 0,
  active      boolean not null default true,
  updated_at  timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.site_customization enable row level security;

drop policy if exists "config: todos leem" on public.site_settings;
create policy "config: todos leem" on public.site_settings for select using (true);
drop policy if exists "config: admin altera" on public.site_settings;
create policy "config: admin altera" on public.site_settings
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "personalização: todos leem" on public.site_customization;
create policy "personalização: todos leem" on public.site_customization for select using (true);
drop policy if exists "personalização: admin gerencia" on public.site_customization;
create policy "personalização: admin gerencia" on public.site_customization
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Fotos (Supabase Storage)
--   Bucket público "anuncios": qualquer um vê; envio só de imagens até 5 MB.
--   Visitante sem conta envia em "visitantes/"; usuário logado na pasta
--   com o próprio id. Só o dono da pasta ou o admin apaga.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('anuncios', 'anuncios', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "fotos: todos veem" on storage.objects;
create policy "fotos: todos veem" on storage.objects
  for select using (bucket_id = 'anuncios');

drop policy if exists "fotos: envio" on storage.objects;
create policy "fotos: envio" on storage.objects
  for insert with check (
    bucket_id = 'anuncios' and (
      (auth.uid() is null and (storage.foldername(name))[1] = 'visitantes')
      or (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

drop policy if exists "fotos: dono ou admin apaga" on storage.objects;
create policy "fotos: dono ou admin apaga" on storage.objects
  for delete using (
    bucket_id = 'anuncios' and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- ---------------------------------------------------------------------
-- Permissões das tabelas para os papéis do Supabase (RLS filtra as linhas)
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.listings, public.site_settings, public.site_customization to anon;
grant insert on public.listings, public.listing_contacts, public.contact_messages to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.profile_stats to authenticated;

-- =====================================================================
-- Tira as funções internas da API pública (alerta do Security Advisor).
--
-- As funções de checagem (é admin? conta ativa?) vão para o schema
-- "private", que o Supabase não expõe em /rest/v1/rpc. As regras de
-- segurança continuam usando elas normalmente.
-- As funções de gatilho (triggers) deixam de poder ser chamadas por
-- visitantes/usuários; os gatilhos continuam funcionando.
-- Só os contadores de visualização e WhatsApp seguem públicos, de propósito.
-- =====================================================================

create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- Mover mantém as regras (policies) apontando para as mesmas funções
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'is_admin') then
    alter function public.is_admin() set schema private;
  end if;
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'conta_ativa') then
    alter function public.conta_ativa() set schema private;
  end if;
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'is_privileged') then
    alter function public.is_privileged() set schema private;
  end if;
end $$;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'ativo'
  );
$$;

create or replace function private.is_privileged()
returns boolean language sql stable security definer set search_path = public
as $$
  select private.is_admin()
      or coalesce(nullif(current_setting('role', true), ''), 'none')
         not in ('anon', 'authenticated');
$$;

create or replace function private.conta_ativa()
returns boolean language sql stable security definer set search_path = public
as $$
  select auth.uid() is null or exists (
    select 1 from public.profiles
    where id = auth.uid()
      and (status = 'ativo' or (status = 'suspenso' and suspended_until < now()))
  );
$$;

-- As regras de segurança rodam como o visitante/usuário: precisam executar
revoke all on function private.is_admin(), private.is_privileged(), private.conta_ativa() from public;
grant execute on function private.is_admin(), private.is_privileged(), private.conta_ativa() to anon, authenticated;

-- Gatilhos passam a chamar as funções do schema private
create or replace function public.profiles_protect_fields()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if not private.is_privileged() then
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

create or replace function public.listings_before_insert()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if not private.is_privileged() then
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

create or replace function public.listings_before_update()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if current_setting('racemarket.contador', true) = 'on' then
    return new;
  end if;

  new.updated_at := now();
  if private.is_privileged() then
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

create or replace function public.contact_messages_before_insert()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if not private.is_privileged() then
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

-- Funções de gatilho: ninguém chama direto (o gatilho continua disparando)
revoke all on function
  public.handle_new_user(),
  public.profiles_protect_fields(),
  public.listings_before_insert(),
  public.listings_before_update(),
  public.notify_listing_change(),
  public.contact_messages_before_insert()
from public, anon, authenticated;

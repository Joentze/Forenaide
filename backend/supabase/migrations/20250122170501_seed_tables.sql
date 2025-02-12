create table templates (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null,
    description text not null,
    extraction_schema json not null,
    created_at timestamp default current_timestamp not null
);

create table strategies (
    id uuid primary key,
    strategy varchar(255) not null,
    name varchar(100) not null,
    description text
);

create table pipeline_runs (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null,
    description text,
    strategy_id uuid not null,
    extraction_schema json not null,
    status varchar(255) not null,
    started_at timestamp default current_timestamp not null,
    completed_at timestamp default current_timestamp not null,
    file_uris text[] not null,
    foreign key (strategy_id) references strategies(id)
);

create table data_sources (
    id uuid primary key,
    uri varchar(255) not null,
    mimetype varchar(50) not null,
    filename varchar(255) not null
);

create table sources_pipeline (
    pipeline_id uuid not null,
    source_id uuid not null,
    primary key (pipeline_id, source_id),
    foreign key (pipeline_id) references pipeline_runs(id),
    foreign key (source_id) references data_sources(id)
);

create table outputs (
    id uuid primary key,
    pipeline_id uuid not null,
    uri varchar(255) not null,
    foreign key (pipeline_id) references pipeline_runs(id)
);
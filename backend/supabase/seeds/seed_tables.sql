create table templates (
    id uuid primary key,
    name varchar(100) not null,
    schema json not null,
    description text,
    created_at timestamp default current_timestamp not null
);

create table strategies (
    id uuid primary key,
    strategy varchar(255) not null
);

create table pipeline_runs (
    id uuid primary key,
    strategy_id uuid not null,
    schema json not null,
    status varchar(255) not null,
    started_at timestamp default current_timestamp not null,
    completed_at timestamp default current_timestamp not null,
    foreign key (strategy_id) references strategies(id)
);

create table data_sources (
    id uuid primary key,
    uri varchar(255) not null,
    format varchar(50) not null,
    run_id uuid not null,
    foreign key (run_id) references pipeline_runs(id)
);

create table outputs (
    id uuid primary key,
    run_id uuid not null,
    uri varchar(255) not null,
    foreign key (run_id) references pipeline_runs(id)
);

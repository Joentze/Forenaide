create table data_sources (
    data_source_id serial primary key,
    uri varchar(255) not null,
    format varchar(50) not null
);

create table templates (
    template_id serial primary key,
    name varchar(100) not null,
    description text,
    created_at timestamp default current_timestamp not null
);

create table fields (
    field_id serial primary key,
    template_id serial not null,
    name varchar(100) not null,
    data_type varchar(50) not null,
    description text,
    foreign key (template_id) references templates(template_id)
);

create table pipeline_runs (
    run_id serial primary key,
    template_id serial not null,
    data_source_id serial not null,
    created_at timestamp default current_timestamp not null,
    foreign key (template_id) references templates(template_id),
    foreign key (data_source_id) references data_sources(data_source_id)
);

create table outputs (
    output_id serial primary key,
    run_id serial not null,
    uri varchar(255) not null,
    foreign key (run_id) references pipeline_runs(run_id)
);


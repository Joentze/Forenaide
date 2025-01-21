insert into data_sources (uri, format) values
('http://example.com/data/source1.csv', 'csv'),
('http://example.com/data/source2.json', 'json'),
('http://example.com/data/source3.xml', 'xml'),
('http://example.com/data/source4.csv', 'csv'),
('http://example.com/data/source5.json', 'json');

insert into templates (name, description) values
('template a', 'template for processing csv files'),
('template b', 'template for processing json files'),
('template c', 'template for processing xml files'),
('template d', 'general purpose template'),
('template e', 'specialized template for large datasets');

insert into fields (template_id, name, data_type, description) values
(1, 'field1', 'string', 'a string field for template a'),
(1, 'field2', 'integer', 'an integer field for template a'),
(2, 'field1', 'string', 'a string field for template b'),
(2, 'field3', 'boolean', 'a boolean field for template b'),
(3, 'field1', 'date', 'a date field for template c'),
(3, 'field4', 'float', 'a float field for template c'),
(4, 'field1', 'string', 'a generic string field'),
(4, 'field5', 'json', 'a json field for template d'),
(5, 'field1', 'text', 'a text field for template e'),
(5, 'field6', 'double', 'a double field for template e');

insert into pipeline_runs (template_id, data_source_id) values
(1, 1),
(1, 4),
(2, 2),
(3, 3),
(4, 1),
(5, 5);

insert into outputs (run_id, uri) values
(1, 'http://example.com/outputs/run1/output1.csv'),
(1, 'http://example.com/outputs/run1/output2.csv'),
(2, 'http://example.com/outputs/run2/output1.json'),
(3, 'http://example.com/outputs/run3/output1.xml'),
(4, 'http://example.com/outputs/run4/output1.csv'),
(5, 'http://example.com/outputs/run5/output1.json');


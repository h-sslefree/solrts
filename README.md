# SolrTS
![Build status on Travis](https://travis-ci.org/h-sslefree/solrts.svg?branch=master)

A TypeScript client for Solr.

Client.ts exposes fundamental operations.
Each of the operations contain public members to specify details about the operation.
Call the async method 'execute' to execute the operation on the Solr server.

## debug
DEBUG=solrts:* node index.js

of in Windows
set DEBUG=soltrs:* & node index.js

## Todo
* support for advanced search (https://lucene.apache.org/solr/guide/6_6/the-standard-query-parser.html#the-standard-query-parser)
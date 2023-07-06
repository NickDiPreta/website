---
title: Partitioning and Secondary Indexes
date: 07/05/2023
description: Partitioning of Key Value Data.
tag: partitioning
author: Nicholas DiPreta
---

## Partitioning and Secondary Indexes

I will be regularly publishing articles with easily digestible chunks relating to partitioning in this series.

The individual articles will be as follows:

1. Introduction to Partitioning
2. Partitioning of Key-Value Data
3. **Partitioning and Secondary Indexes**
4. Rebalancing Partitions
5. Request Routing
6. Partitioning in the Real World


---

So far I've discussed partitioning schemes for a key-value data model. This article will add a bit of complexity in the form of secondary indexes. Secondary indexes are often used for measuring occurances for specfic values.

Both relational and document based databases use secondary indexes. Key-value stores generally avoid secondary indexes because of the added complexity, but certain outliers, like Riak, are making use of them becaue of their usefulness in data modelling. Secondary indexes are what make servers like Solr and Elasticsearch work so well. 

### Partitioning Secondary Indexes by Document


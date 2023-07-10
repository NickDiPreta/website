---
title: Partitioning and Secondary Indexes
date: 07/08/2023
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

One approach to partitioning a database with secondary indexes is document-based. Imagine you are creating a website for selling NFT Art. Each listing has a unique ID - in this example the document ID. Our database is partitioned by document ID. Soon, you realize that you need to let users search by primary creator of the NFT. To make this search efficient, you need a secondary index on creator. In this approach, each partitioning is completely separate. Each partition has its own set of secondary indexes relevant only to the documents in that partition. Writing to the DB only requires you to deal with the partition that contains the documentID you are looking for. This is called a local index. The challenge arises when querying a secondary ID that exists across several different databases. Let's say a specific creator has NFTs whose document IDs are very different and so they are put on three different partitions. If you want to search for art by this creator, you need to send the query to all three paritions.

This scatter/gather approach can make querying pretty expensive.

## Partitioning Secondary Indexes by Term

In the context of partitioning secondary indexes by term, let's consider a different example to illustrate the concept. Imagine we have a database that stores information about books. Each book has various attributes, including its genre.

Instead of creating separate secondary indexes for each partition, we can create a global index that covers all the partitions. However, storing this global index on a single node would create a bottleneck and defeat the purpose of partitioning. Therefore, the global index also needs to be partitioned, but differently from the primary key index.

Let's say we have books of different genres distributed across multiple partitions. In the global index, all the books of a specific genre would be listed under the respective term, such as "genre:fantasy" or "genre:mystery." However, the index itself would be partitioned in a way that genres starting with the letters "a" to "m" are stored in partition 0, and genres starting with "n" to "z" are stored in partition 1.

|                   |               |                       |
|-------------------|---------------|-----------------------|
| **Partition 0**   | **Partition 1**|     ...               |
| color:red         | color:orange  |     ...               |
| color:blue        | color:purple  |     ...               |
| genre:fantasy     | genre:mystery |     ...               |
| genre:romance     | genre:sci-fi   |     ...               |
| ...               | ...           |     ...               |
|                   |               |                       |

This type of index is referred to as term-partitioned because the term (in this case, the genre) determines the partition of the index. The concept of a term is borrowed from full-text indexes, where terms represent the words present in a document.

Just like before, we can choose to partition the index based on the term itself or use a hash of the term. Partitioning by the term allows efficient range scans, such as searching for books within a specific price range. On the other hand, partitioning based on a hash of the term ensures a more balanced distribution of the workload across partitions.

The advantage of a global (term-partitioned) index over a document-partitioned index is improved read efficiency. Instead of scanning all partitions, a client only needs to query the partition containing the desired term. However, the drawback is that write operations become slower and more complex. Updating a single book may now affect multiple partitions of the index since each term in the book (genre, in this case) could reside on a different partition, possibly on a different node.

Ideally, the index would always be up to date, reflecting every book written to the database immediately. However, achieving this in a term-partitioned index would require a distributed transaction across all affected partitions, which is not supported in all databases. Therefore, updates to global secondary indexes are often asynchronous. If you read the index shortly after a write, the change you made may not yet be reflected in the index.

## Conclusion

We have explored different approaches to partitioning secondary indexes in databases. We discussed document-based partitioning, where each partition has its own set of secondary indexes relevant to the documents in that partition. While this approach offers localized indexing, querying across multiple partitions can be costly and inefficient.

We also examined term-partitioned indexing, where a global index covers all partitions but is partitioned based on specific terms. This allows for improved read efficiency as clients only need to query the partition containing the desired term. However, updating the index becomes more complex, and there may be delays in reflecting changes across all partitions.

Partitioning secondary indexes offers benefits in terms of performance and workload distribution. It allows for more efficient searches and optimized resource utilization. However, it also introduces challenges, such as the trade-off between read and write operations and the need to handle queries spanning multiple partitions.

Overall, understanding different partitioning strategies for secondary indexes is crucial for designing scalable and efficient database systems. By carefully considering the nature of the data and the expected workload, developers can choose the most suitable partitioning approach to meet their specific requirements.

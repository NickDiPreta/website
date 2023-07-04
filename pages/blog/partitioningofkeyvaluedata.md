---
title: Partitioning of Key Value Data
date: 07/04/2023
description: Partitioning of Key Value Data.
tag: partitioning
author: Nicholas DiPreta
---

## Partitioning of Key-Value Data

I will be regularly publishing articles with easily digestible chunks relating to partitioning in this series.

The individual articles will be as follows:

1. Introduction to Partitioning
2. **Partitioning of Key-Value Data**
3. Partitioning and Secondary Indexes
4. Rebalancing Partitions
5. Request Routing
6. Partitioning in the Real World


---

### Skew and Hot Spots

The goal with partitioning is to spread data and query load evenly across nodes in our system. In theory, if we have 10 nodes and data is split evenly across all 10 nodes, then we should be able to handle 10 times as much data and 10 times the io throughout of a single node. However, a common occurance is for partitions to have an uneven distribution of either throughput or data. If the partitioning is uneven, we call it *skewed*. It is important to think about time frame when discussing skew. Short term skew is expected to some acceptable degree (that degree depends on usecase). Long term skew, or a partition with unexpectedly high load is called a hot spot. We are going to be discussing partitioning approaches that are designed to avoid skew and hotspots.

### Random Assignment

The simplest method for avoiding hot spots would be to assign records to nodes randomly. Sure, that can distribute data pretty evenly, but at a major cost. When you're trying to read a particular item, you have notion of what node it is on, so you need to query all nodes in parallel. Here's how we can do better.

### Partitioning by key range

Let's assume that we have a simple key-value data model. One way of partitioning is to assign a continuous range of keys to each partition. If you know the boundaries between ranges, you can easily determine which partition contains any given key. 

The range of keys per partition may not necessarily be the same. If we intend to evenly distribute the data we need to adjust the partitions to contain ranges with even distributions of data. For example, let's say we have 75 records for the letter A, but only 25 records for the letters B,C, and D. A valid balanced partitioning scheme here would be to have half of the records on node A and half on node B. Thus we only have 1/3 of the key range covered on a single node and the remaining 2/3rds of the key range on the second node.

![Range Partition Illustration](/images/rangepartition1.jpeg)

Within each partition we can keep keys in sorted order to make range scans quick. We can even treat the key as a concatenated index in order to fetch several records at once.

Range partitioning does, however, have its downsides. Certain access patterns can lead to hot spots. Thus, a viable alternative that is commonly used is partitioning by hash of key.

### Partitioning by hash of key

A good hash function distributes data uniformly. The hashing function does not need to be cryptographically strong for partitioning. Hash partitioning is an easy-to-use alternative to range partitioning, especially when your data has no obvious partitioning key or when the data to be partitioned is not historical.

Some DBMS, like MySQL, have built in hash partitioning that you can chose to use or not to use. <sup>[1][]</sup> Apache Spark, which is used to process large data sets in a distributed manner, uses a Hash Partitioner as it's default partitioning method.<sup>[2][]</sup> One disadvantage to distributing keys across partitions howeverm is that we lose the ability to efficiently do range queries. Apache Cassandra takes a middle ground approach by using a compound primary key. I'll detail that more in the article on Partitioning in the Real World later in this series.

![Hash Partition Illustration](/images/hash_functions.jpeg)

### A note on "Consistent Hashing"

Consistent hashing is a way of evenly distributing load across a system by using randomly chosen partition boundaries. I'll go further into detail on why this particular approach doesn't work well in actuality in the Rebalancing Partitions article later in this series.

[1]: <https://dev.mysql.com/doc/mysql-partitioning-excerpt/8.0/en/partitioning-hash.html> "MySQL:: MySQL Partitioning: 3.4 HASH Partitioning"
[2]: https://www.clairvoyant.ai/blog/custom-partitioning-an-apache-spark-dataset#:~:text=Spark%20Default%20Partitioner&text=The%20Hash%20Partitioner%20works%20on,distribute%20them%20across%20the%20partitions. "Custom partitioning for better distribution of your data while creating partitions in spark jobs"

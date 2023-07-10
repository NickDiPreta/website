---
title: Rebalancing Partitions
date: 07/10/2023
description: Strategies for efficient data redistribution.
tag: partitioning
author: Nicholas DiPreta
---

## Partitioning and Secondary Indexes

I will be regularly publishing articles with easily digestible chunks relating to partitioning in this series.

The individual articles will be as follows:

1. Introduction to Partitioning
2. Partitioning of Key-Value Data
3. Partitioning and Secondary Indexes
4. **Rebalancing Partitions**
5. Request Routing
6. Partitioning in the Real World

---

## Rebalancing Partitions: Strategies for Efficient Data Redistribution

Over time, databases undergo changes that require redistributing data and requests among nodes in a cluster. These changes can include increasing query throughput, expanding the dataset size, or accommodating failed machines. The process of moving the workload from one node to another in a cluster is known as **rebalancing**.

Regardless of the chosen partitioning scheme, effective rebalancing should meet certain minimum requirements:

1. **Fair Load Distribution**: After rebalancing, the workload, including data storage and read/write requests, should be evenly distributed across all nodes in the cluster.
2. **Continuous Availability**: The database should continue to accept read and write operations while rebalancing is in progress.
3. **Efficiency**: Minimize the amount of data transferred between nodes to ensure fast rebalancing and reduce network and disk I/O load.

In this article, we will explore different strategies for rebalancing partitions in distributed databases and their implications.

## Strategies for Rebalancing

Let's examine a few common methods for assigning partitions to nodes:

### Hash Mod N Approach: A Suboptimal Choice

One simple approach for partitioning data is to use the modulo operator (`%`) to assign keys to nodes. For instance, using `hash(key) % 10` would assign a key to a node based on the remainder of its hash value divided by 10. However, this approach has a major drawback. When the number of nodes changes, most keys will need to be moved between nodes, resulting in frequent and costly rebalancing operations.

### Fixed Number of Partitions: Achieving Balance

An effective solution is to create a larger number of partitions than there are nodes and assign multiple partitions to each node. For example, a database running on a 10-node cluster could have 1,000 partitions, with approximately 100 partitions assigned to each node initially.

When a new node joins the cluster, it can take a few partitions from each existing node until the workload is evenly distributed. Similarly, when a node is removed, its partitions can be distributed among the remaining nodes. This method ensures rebalancing without the need to move individual keys. Only entire partitions are transferred, reducing the overall data movement.

Fixed partitioning is used by several databases like Riak, Elasticsearch, Couchbase, and Voldemort. However, choosing the appropriate number of partitions can be challenging, as it requires considering the dataset's variable size and balancing management overhead against performance.

### Dynamic Partitioning: Adapting to Dataset Changes

Dynamic partitioning is particularly useful for key range partitioning, where the number and boundaries of partitions are not fixed. Databases like HBase and RethinkDB employ this approach, dynamically creating and splitting partitions based on data size.

As a partition grows beyond a configured threshold, it is split into two partitions, approximately distributing the data equally. Conversely, if data is deleted, a partition can be merged with an adjacent one. This process adjusts the number of partitions based on the dataset's volume, preventing inefficient resource allocation.

While dynamic partitioning accommodates dataset growth, an empty database starts with a single partition. To mitigate this, databases like HBase and MongoDB allow pre-splitting, where initial partitions are configured based on anticipated key distribution.

Dynamic partitioning can be used for both key range and hash partitioning, as demonstrated by MongoDB since version 2.4.

### Proportional Partitioning: Scaling with Nodes

Cassandra and Ketama adopt a unique strategy by making the number of partitions proportional to the number of nodes. In this approach, each node handles a fixed number of partitions, regardless of the dataset size. As the dataset grows, the partition size increases while the number of partitions per node remains constant.

When a new node joins the cluster, it randomly selects existing partitions to split, taking ownership of one half of each split partition. This randomized splitting ensures a fair distribution of the workload. Cassandra 3.0 introduced an improved rebalancing algorithm to address potential unfair splits.

By adapting the number of partitions to the dataset size or node count, proportional partitioning achieves a balanced workload across nodes.

## Automated or Manual Rebalancing?

An important consideration in rebalancing is determining whether the process should be automated or manual.

Fully automated rebalancing requires no administrator intervention. The system automatically decides when to move partitions between nodes. While convenient for routine maintenance, it can be unpredictable and potentially overload the network or nodes, affecting overall performance.

On the other hand, fully manual rebalancing allows administrators to explicitly configure the partition assignments and change them as needed. This approach adds an extra layer of control, preventing unexpected performance degradation during rebalancing.

There is a spectrum between these two extremes, where some databases generate suggested partition assignments automatically but require administrator confirmation before applying the changes. This approach strikes a balance between automation and control.

## Conclusion

Efficient rebalancing is crucial for distributed databases to maintain optimal performance and resource utilization. By carefully selecting a partitioning strategy and considering factors such as load distribution, continuous availability, and data movement, databases can achieve effective rebalancing.

Whether employing fixed or dynamic partitioning, proportional partitioning, or a combination of manual and automated rebalancing, the chosen approach should align with the database's specific requirements and the anticipated dataset size.

By embracing intelligent rebalancing strategies, distributed databases can adapt to evolving workloads, ensure optimal resource allocation, and deliver a seamless user experience.

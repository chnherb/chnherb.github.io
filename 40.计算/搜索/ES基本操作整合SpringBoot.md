# 概述

## Spring Data Elasticsearch

参考spring官方文档：[https://spring.io/projects/spring-data-elasticsearch](https://spring.io/projects/spring-data-elasticsearch)

# 引入ES

## 引入依赖

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-data-elasticsearch</artifactId>
</dependency>
```
实际是利用spring-data去操作elasticsearch
## 自定义ES配置

application.properites

```plain
elasticsearch.host=localhost:9200
```

## 配置客户端

这里tcp端口9300除了与业务交互，还可以是集群之间心跳检测等。

```java
@Configuration
public class RestClientConfig extends AbstractElasticsearchConfiguration {
  @Value("${elasticsearch.host}")
  private String host
  @Override
  @Bean
  public RestHighLevelClient elasticsearchClient() {
    final ClientConfiguration clientConfiguration = 
      ClientConfiguration.builder()
      //.connectedTo("xx.xx.xx.xx:9200")
      .connectedTo(host)
      .build();
    return RestClients.create(clientConfiguration).rest();
  }
}
```

### 
# 操作ES

## 客户端对象

### ElasticsearchOperations

虽然没有显式创建，但是spring data确实创建了这个对象。

始终以面向对象的方式去操作ES。

### RestHighLevelClient（推荐）

通过REST方式去操作，和Kibana操作一致。

# ElasticsearchOperations

优点：操作简单

缺点：耦合性强，复杂操作可能更复杂

## 相关注解

@Document：将这个类对象转换为 ES 中一条文档进行录入

indexName：创建索引的名称

createIndex：是否创建索引

```java
@Document(indexName = "books", createIndex = true)
public class Book {
  @Id
  private Integer id;
  @Field(type = FieldType.Keyword)
  private String title;
  @Field(type = FieldType.Float)
  private String price;
  @Field(type = FieldType.Text, analyzer="ik_max_word")
  private String description;
  // get & set
}
```
## 操作

```java
// 或者使用注解取代继承
public class ESOptionsTest extends SpringBootXXXApplicationTests {
  private final ElasticsearchOperations elasticsearchOperations;
  @Autowired
  public ESOptionsTest(ElasticsearchOperations elasticsearchOperations) {
    this.elasticsearchOperations = elasticsearchOperations;
  }
  
  @Test
  public void testIndex() {
    Book book = new Book();
    // 设置各种属性
    book.setxx;
    // save 索引一条文档 更新一条文档
    // 当文档不存在时添加，存在时更新
    elasticsearchOperations.save(book);
    // 查询
    book b = elasticsearchOperations.get("1", Book.class);
    // 删除
    Book b2 = new Book();
    p2.setId(1);
    elasticsearchOperations.delete(p2);
    // 删除所有
    elasticsearchOperations.delete(Query.findAll(), Book.class);
    // 查询所有
    SearchHits<Book> bookSearchHits = elasticsearchOperations.search(Query.findAll(), Book.class);
    // bookSearchHits.getMaxScore();
    // bookSearchHits.getTotalHits()
    // bookSearchHits.getContent(); //每一条文档内容
  }
  
}
```
注意：通过这种方式，然后去查询数据时，在返回的hits结果数据集中，_source字段也就文档源数据中会增加一个字段 _class用来记录反序列化的全类名
# RestHighLevelClient

## 创建索引映射

接上文写测试方法，测试类同上类似

```java
public class RestHighLevelClientTest extends SpringBootXXXApplicationTests {
  private final ElasticsearchOperations elasticsearchOperations;
  @Autowired
  public RestHighLevelClientTest(RestHighLevelClient restHighLevelClient) {
    this.restHighLevelClient = restHighLevelClient;
  }
  @Test
  public void testRestHighLevelClient() throws IOException {
    
    // 1、创建索引并指定映射
    CreateIndexRequest createIndexRequest = new CreateIndexRequest("books");
    // 指定映射，参数1：指定映射(DSL中mappings后的json内容，带大括号)；参数2：指定数据类型
    createIndexRequest.mapping("xxx", XContentType.JSON);
    // 参数1：创建索引请求对象；2：请求配置对象
    CreateIndexReponse resp = restHighLevelClient.indices().create(createIndexRequest, RequestOptions.DEFAULT);
    resp.isAcknowledged(); // 创建状态，true表示成功
    
    // 2、删除索引
    AcknowledegdReponse resp2 = restHighLevelClient.indices().delete(new DeleteIndexRequest("books"), RequestOptions.DEFAULT);   
    
    // 3、索引文档(添加文档)
    IndexRequest indexRequest = new IndexRequest("books");
    indexRequest.id("2") // 指定文档id
        .source("xx"); // 指定文档内容，同之前json内容
    IndexResponse resp3 = restHighLevelClient.index(indexRequest, RequestOptions.DEFAULT);
    resp3.status(); // 状态
    
    // 4、更新文档
    UpdateRequest updateRequest = new UpdateRequest("books", "1");
    updateRequest.doc("xx", XContent.JSON);
    restHighLevelClient.update(updateRequest, RequestOptions.DEFAULT);

    // 5、删除文档
    DeleteRequest deleteRequest = new DeleteRequest("books", "1");
    restHighLevelClient.update(deleteRequest, RequestOptions.DEFAULT);

    // 6、查询文档
    GetRequest getRequest = new GetRequest("books", "1");
    GetResponse getResponse = restHighLevelClient.get(getRequest, RequestOptions.DEFAULT);

    // 7、查询
    // 查询所有
    query(QueryBuilders.matchAllQuery()); // 查询所有
    // term查询
    query(QueryBuilders.termQuery("description", "中国"));
    // range范围查询
    query(QueryBuilders.rangeQuery("price").gt(0).lte(1.11));          

    // 255、使用完关闭
    restHighLevelClient.close();
  }
  // 简单封装查询条件
  public void query(QueryBuilder queryBuilder) throws IOException {
    SearchRequest searchRequest = new SearchRequest("books");
    SearchSourceBuilder sourceBuilder = new SearchSourceBuilder(); // 指定条件对象
    HightlighterBuilder hightlighterBuilder = new HightlighterBuilder();
    // 高亮器
    hightlighterBuilder.requireFieldMatch(false)
        .field("description")
        .field("title")
        .preTags("<span style='color:red;'>")
        .postTags("</span>");
    sourceBuilder.query(queryBuilder)
        .from(0)
        .size(10)
        .sort("id", SortOrder.ASC)
        .fetchSource(new String[]{"id", "title"})
        .hightlighter(hightlighterBuilder)
        .postFilter(QueryBuilder.termQuery("titile", "中国"));
    searchRequest.source(sourceBuilder); // 指定查询条件
    SearchResponse searchResponse = restHighLevelClient.search(searchRequest, RequestOptions.DEFAULT);
  }
}
```

## 对象写入读取

测试类代码同上

```java
@Test
public void testWrite2ES() {
  Book book = new Book(); // 这个对象可以不用@Document、@Field相关注解
  book.setxxx;
  // 写入ES，基本同上文插入文档
  IndexRequest indexRequest = new IndexRequest("books");
  indexRequest.id(book.getId().toString())
      .source(new ObjectMapper().writeValueAsString(book), XContentType.JSON);
  IndexResponse indexResponse = restHighLevelClient.index(indexRequest, RequestOptions.DEFAULT);
  
  // 读取数据
  SearchRequest searchRequest = new SearchRequest("books");
  SearchSourceBuilder sourceBuilder = new SearchSourceBuilder(); // 指定条件对象
  sourceBuilder.query(QueryBuilders.matchAllQuery());
  searchRequest.source(sourceBuilder); // 指定查询条件
  SearchResponse searchResponse = restHighLevelClient.search(searchRequest, RequestOptions.DEFAULT);
  SearchHit[] hits = searchResponse.getHits();
  List<Book> books = new ArrayList<>();
  for (SearchHit hit: hits) {
    System.out.println(hit.getSourceAsString()); // json
    Book b = new ObjectMapper().readValue(hit.getSourceAsString(), Book.class);
    // 处理高亮，做替换
    // xxxx
    books.add(b);
  }
}
```

## 聚合查询

测试类同上

```java
@Test
public void testAggs() throws IOException {
  SearchRequest searchRequest = new SearchRequest();
  SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
  sourceBuilder.query(QueryBuilder.matchAllQuery()) //查询条件
        .aggregation(AggregationBuilders.terms("price_group").field("price")) // 设置聚合处理
        .size(0);
  searchRequest.source(sourceBuilder);
  SearchResponse searchResponse = restHighLevelClient.search(searchRequest, RequestOptions.DEFAULT);
  // 处理聚合结果
  Aggregations aggregations = searchResponse.getAggregations();
  ParsedDoubleTerms parsedDoubleTerms = aggregations.get("price_group");
  List<? extends Terms.Bucket> buckets = parsedDoubleTerms.getBuckets();
  for (Terms.Bucket bucket : buckets) {
     bucket.getKey();
     bucket.getDocCount();
  }
}
```





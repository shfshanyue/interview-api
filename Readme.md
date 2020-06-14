# GraphQL API for Daily-Question

这是关于 [面试每日一题](https://github.com/shfshanyue/Daily-Question) 提供的 GraphQL 接口

## Query

![Query](./assets/query.png)

更多文档查看 [GraphQL Playground and Documentation](https://interview.shanyue.tech/graphql)

### 获取所有面试题

``` gql
query QUESTIONS {
  questions {
    id
    number
    title
    body
    selfAnswer {
      id
      author
      body
    }
  }
}
```

### 获取某道面试题

``` gql
query QUESTION {
  question (number: 3) {
    id
    number
    title
    body
    selfAnswer {
      id
      author
      body
    }
  }
}
```
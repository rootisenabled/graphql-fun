const fetch = require('node-fetch');
const util = require('util');
const parseXML = util.promisify(require('xml2js').parseString);

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLString
} = require('graphql');

const API_KEY = '4FyBZVQWMZiWN1NYUOBgw';

const Book = new GraphQLObjectType({
  name: 'Book',
  description: 'book',
  fields: () => ({
    title: {
      type: GraphQLString,
      resolve: xml => xml.GoodreadsResponse.book[0].title[0]
    },
    description: {
      type: GraphQLString,
      resolve: xml => xml.GoodreadsResponse.book[0].description[0]
    }
  })
})

const Author = new GraphQLObjectType({
  name: 'Author',
  description: 'Author name',
  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: (xml) => xml.GoodreadsResponse.author[0].name[0]
    },
    books: {
      type: new GraphQLList(Book),
      resolve: xml => {
        const ids = xml.GoodreadsResponse.author[0].books[0].book.map(elem => elem.id[0]._)
        return Promise.all(ids.map(id =>
          fetch(`https://www.goodreads.com/book/show/${id}.xml?key=${API_KEY}`)
            .then(response => response.text())
            .then(parseXML)
        ))
      }
    }
  })
})

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: '...',
    fields: () => ({
      author: {
        type: Author,
        args: {
          id: {
            type: GraphQLInt
          }
        },
        resolve: (_, args) => fetch(
            `https://www.goodreads.com/author/list/${args.id}?format=xml&key=${API_KEY}`
          )
          .then(res => res.text())
          .then(parseXML)
      }
    })
  })
})
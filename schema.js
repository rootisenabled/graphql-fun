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
      resolve: xml => xml.title[0]
    },
    description: {
      type: GraphQLString,
      resolve: xml => xml.description[0]
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
      resolve: xml => xml.GoodreadsResponse.author[0].books[0].book
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
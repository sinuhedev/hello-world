// use demo;

// users

db.users.drop();
db.users.createIndex({ email: 1 }, { unique: true });
db.users.getIndexes();

db.users.insertMany([
  {
    name: "Sinuhe",
    email: "sinuhe.dev@gmail.com",
  },
  {
    name: "Alberto",
    email: "sinuhe.dev@gmail.com",
  },
]);

// books

db.books.insertMany([
  {
    title: "MongoDB: The Definitive Guide",
    author: ["Kristina Chodorow", "Mike Dirolf"],
    published_date: ISODate("2010-09-24"),
    pages: 216,
    language: "English",
  },
  {
    title: "50 Tips and Tricks for MongoDB Developer",
    author: "Kristina Chodorow",
    published_date: ISODate("2011-05-06"),
    pages: 68,
    language: "English",
  },
]);

// join

db.users.updateOne(
  { email: "sinuhe.dev@gmail.com" },
  {
    $set: {
      books: [ObjectId("63d8724dd6aa1dbde9cc5fd8")],
    },
  }
);

db.users.aggregate([
  {
    $lookup: {
      localField: "books",
      as: "books",
      from: "books",
      foreignField: "_id",
    },
  },
]);

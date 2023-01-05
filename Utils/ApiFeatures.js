class ApiFeatures {
  constructor(query, queryString) {
    (this.query = query), (this.queryString = queryString);
  }

  filter() {
    const queries = { ...this.queryString };
    const excluded = ['page', 'sort', 'limit', 'fields'];

    excluded.forEach((el) => {
      delete queries[el];
    });

    let queryStr = JSON.stringify(queries);

    queryStr = queryStr.replace(
      /\b(gte|lte|gt|lt|ne)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }
  // sort() is method that is apply on the req.query although a comma is usually sepersting the sorting parameters you have to split and then join it again with a space to be able to work for moongose
  sort() {
    if (this.queryString.sort) {
      const sortby = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(sortby);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  pagination() {
    if (this.queryString.page) {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 3;
      const skip = (page - 1) * limit;

      this.query = this.query.skip(skip).limit(limit);
    }

    return this;
  }
  //its called fields in from the browser but for moongosse to query a particular field you will need to use 'select' and you seperate using split(', ') and join using join(' ')..... the - stands for remove something
  fields() {
    if (this.queryString.fields) {
      const field = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(field);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
}

module.exports = ApiFeatures;

// resolvers.js

const { PythonShell } = require("python-shell");

const resolvers = {
  Query: {
    async getUserCollections(_, { user_id }) {
      return new Promise((resolve, reject) => {
        PythonShell.run(
          "upload_service.py",
          {
            args: ["getUserCollections", user_id],
          },
          (err, result) => {
            if (err) reject(err);
            resolve(JSON.parse(result[0]));
          }
        );
      });
    },
  },
  Mutation: {
    async uploadFile(_, { user_id, file_content, file_name }) {
      return new Promise((resolve, reject) => {
        PythonShell.run(
          "upload_service.py",
          {
            args: ["import_data", user_id, file_content, file_name],
          },
          (err, result) => {
            if (err) reject(err);
            resolve(result[0]);
          }
        );
      });
    },
  },
};

module.exports = resolvers;

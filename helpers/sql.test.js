const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function() {
    test("works", function() {
        const dataToUpdate = {firstName: 'Aliya', age: 32};
        const jsToSql = {"firstName": "first_name", "age": "age"};
        const output = sqlForPartialUpdate(dataToUpdate, jsToSql);

        expect(output).toEqual({setCols: "\"first_name\"=$1, \"age\"=$2", values: ['Aliya', 32]})
    })
})
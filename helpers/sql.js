const { BadRequestError } = require("../expressError");

/* Function to produce corresponding SQL code to update an existing DB entry 

dataToUpdate: JS object 
{field1: updateVal, field2: updateVal, ...}

jsToSql: JS object that contains JS key name and SQL column name
{key1: SQL_column_name, key2: SQL_column_name}

return value: JS object that contains SQL code and array of insert values
{setCols: SQL code,
values: array_of_vals}


Example:
dataToUpdate = {firstName: 'Aliya', age: 32}
jsToSql = {"firstName": "first_name", "age": "age"}
return value: {setCols: `first_name=$1, age=$2`,
               values: ['Aliya', 32]}
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };

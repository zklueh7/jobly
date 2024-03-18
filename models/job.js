"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
    /** Create a job (from data), update db, return new job data.
     *
     * data should be { title, salary, equity, company_handle }
     *
     * Returns { title, salary, equity, company_handle }
     *
     * Throws BadRequestError if job already in database.
     * */


    // add new job to database
    static async create({ title, salary, equity, company_handle }) {
        const result = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING title, salary, equity, company_handle AS "companyHandle"`, 
            [title, salary, equity, company_handle]
        );

        return result.rows[0];
    }

    // get list of all jobs from database
    // returns [{title, salary, equity, companyHandle}, ...]
    static async findAll(query) {
        let queryString = "";
        let title = query.title;
        let minSalary = query.minSalary;
        let hasEquity = query.hasEquity;

        if (title) {
            queryString += `WHERE LOWER(title) LIKE LOWER('%${title}%')`;
            if (typeof minSalary != 'undefined') {
                queryString += ` AND salary > ${+minSalary}`;
            }
            if (hasEquity == "true") {
                queryString += ` AND equity != 0`;
            }
            console.log("1");
        }

        if (!title && (typeof minSalary != 'undefined')) {
            queryString += `WHERE salary > ${+minSalary}`;
            if (hasEquity == "true") {
                queryString += ` AND equity != 0`;
            }
            console.log("2");
        }

        if (!title && (typeof minSalary == 'undefined') && (hasEquity == 'true')) {
            queryString += `WHERE equity != 0`;
            console.log("3");
        }

        console.log(queryString);

        const results = await db.query(
            `SELECT id, title, salary, equity, company_handle AS companyHandle 
            FROM jobs 
            ${queryString}
            ORDER BY title`
        );
        

        if (results.rows.length == 0) {
            throw new NotFoundError(`No jobs found`);
        }
        return results.rows;
    }

    // Get job by id
    // throw not found error if job not found
    static async get(id) {
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`, [id]
        );

        if (!result.rows[0]) {
            throw new NotFoundError(`Job with id ${id} not found`);
        }

        return result.rows[0];
    }

    // Update job info
    static async update(title, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                companyHandle: "company_handle"
            });
        
        const titleVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs
                          SET ${setCols}
                          WHERE title = ${titleVarIdx}
                          RETURNING title, salary, equity, company_handle AS companyHandle`;

        const result = await db.query(querySql, [...values, title]);
        const job = result.rows[0];

        if(!job) throw new NotFoundError(`No job: ${title}`);

        return job;
    }

    // Delete company by id
    // throw not found error if job not found
    static async remove(id) {
        const result = await db.query(
            `DELETE FROM jobs
            WHERE id = $1
            RETURNING id`, [id]);

        if (!result.rows[0]) {
            throw new NotFoundError(`There is no job with id: ${id}`);
        }

        console.log(result.rows[0]);

        return result.rows[0];
    }
}

module.exports = Job;
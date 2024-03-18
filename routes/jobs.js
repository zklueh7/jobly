"use strict";

/** Routes for jobs */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
// const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { id, title, salary, equity }
 *
 * Returns { id, title, salary, equity }
 *
 * Authorization required: admin
 */

router.post("/", async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.create(req.body);
      return res.status(201).json({ job });
    } catch (err) {
      return next(err);
    }
  });


/** GET /  =>
 *   { jobs: [ { title, salary, equity, company_handle }, ...] }
 *
 * Can filter on provided search filters:
 * - title
 * - minSalary
 * - hasEquity (will find jobs that have non-zero amount of equity)
 *
 * Authorization required: none
 */

router.get("/", async function(req, res, next) {
    try {
        const jobs = await Job.findAll(req.query);
        return res.json( {jobs} );
    }
    catch(err) {
        return next(err);
    }
})


/** GET /[id]  =>  { job }
 *
 *  Job is { id, title, salary, equity, company_handle }
 *
 * Authorization required: none
 */

router.get("/:id", async function(req, res, next) {
    try {
        const job = await Job.get(req.params.id);
        return res.json( {job} );
    }
    catch(err) {
        return next(err);
    }
})


/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: admin
 */

router.delete("/:id", ensureIsAdmin, async function(req, res,next) {
    try {
        const job = await Job.remove(req.params.id);
        return res.json({deleted: req.params.id});
    }
    catch (err) {
        return next(err);
    }
})

module.exports = router;
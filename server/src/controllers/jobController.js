const db = require("../config/db");
const { validationResult } = require("express-validator");

exports.createJob = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { company, role, status, applied_date, notes, job_link } = req.body;
  const userId = req.user.id;

  try {
    const query = `
      INSERT INTO job_applications 
      (user_id, company, role, status, applied_date, notes, job_link) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;

    const values = [
      userId,
      company,
      role,
      status || "Applied",
      applied_date || null,
      notes || null,
      job_link || null,
    ];

    const result = await db.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.getJobs = async (req, res, next) => {
  const userId = req.user.id;
  const { status, search } = req.query;

  try {
    let queryText = `
      SELECT * FROM job_applications 
      WHERE user_id = $1
    `;
    const queryParams = [userId];
    let paramIndex = 2;

    if (status) {
      queryText += ` AND status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (search) {
      queryText += ` AND (company ILIKE $${paramIndex} OR role ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    queryText += ` ORDER BY created_at DESC`;

    const result = await db.query(queryText, queryParams);
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
};

exports.updateJob = async (req, res, next) => {
  const { id } = req.params;
  const { company, role, status, applied_date, notes, job_link } = req.body;
  const userId = req.user.id;

  try {
    const checkJob = await db.query(
      "SELECT * FROM job_applications WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (checkJob.rows.length === 0) {
      return res.status(404).json({ error: "Job application not found" });
    }

    const query = `
      UPDATE job_applications 
      SET company = COALESCE($1, company),
          role = COALESCE($2, role),
          status = COALESCE($3, status),
          applied_date = COALESCE($4, applied_date),
          notes = COALESCE($5, notes),
          job_link = COALESCE($6, job_link),
          updated_at = NOW()
      WHERE id = $7 AND user_id = $8
      RETURNING *
    `;

    const values = [
      company,
      role,
      status,
      applied_date,
      notes,
      job_link,
      id,
      userId,
    ];

    const result = await db.query(query, values);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.deleteJob = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await db.query(
      "DELETE FROM job_applications WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job application not found" });
    }

    res.status(200).json({ message: "Job application deleted successfully" });
  } catch (err) {
    next(err);
  }
};

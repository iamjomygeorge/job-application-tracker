exports.up = (pgm) => {
  pgm.createTable("job_applications", {
    id: "id",
    user_id: {
      type: "uuid",
      notNull: true,
      references: '"auth"."users"',
      onDelete: "CASCADE",
    },
    company: { type: "text", notNull: true },
    role: { type: "text", notNull: true },
    status: {
      type: "text",
      notNull: true,
      default: "Applied",
      check: "status IN ('Applied', 'Interview', 'Offer', 'Rejected')",
    },
    applied_date: { type: "date" },
    notes: { type: "text" },
    job_link: { type: "text" },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("job_applications", "user_id");

  pgm.createFunction(
    "update_updated_at_column",
    [],
    { returns: "trigger", language: "plpgsql", replace: true },
    `BEGIN NEW.updated_at = NOW(); RETURN NEW; END;`
  );

  pgm.createTrigger("job_applications", "update_job_applications_modtime", {
    when: "BEFORE",
    operation: "UPDATE",
    function: "update_updated_at_column",
    level: "ROW",
  });
};

exports.down = (pgm) => {
  pgm.dropTrigger("job_applications", "update_job_applications_modtime");
  pgm.dropFunction("update_updated_at_column", [], { ifExists: true });
  pgm.dropTable("job_applications");
};

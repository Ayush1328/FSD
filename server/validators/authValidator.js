const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address format"),
  password: z.string().min(6, "Password must be at least 6 characters long")
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address format"),
  password: z.string().min(1, "Password is required")
});

const validateBody = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ errors: error.errors.map(e => e.message) });
  }
};

module.exports = {
  validateRegister: validateBody(registerSchema),
  validateLogin: validateBody(loginSchema)
};
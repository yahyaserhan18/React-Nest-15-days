import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Database: either DATABASE_URL or DB_* vars
  DATABASE_URL: Joi.string().optional().allow(''),
  DB_HOST: Joi.string().optional().default('localhost'),
  DB_PORT: Joi.string().optional().default('5432'),
  DB_USERNAME: Joi.string().optional().default('postgres'),
  DB_PASSWORD: Joi.string().optional().default(''),
  DB_NAME: Joi.string().optional().default('students_db'),

  // With default
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .messages({
      'any.only': 'NODE_ENV must be one of: development, production, test',
    }),
  PORT: Joi.number().default(3000),

  // Optional with defaults
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),

  // Optional
  RABBITMQ_URL: Joi.string().optional().allow('').empty(''),
});

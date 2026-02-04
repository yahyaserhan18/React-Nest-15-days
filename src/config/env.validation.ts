import * as Joi from 'joi';

const hasDatabaseUrl = Joi.string().min(1);

export const envValidationSchema = Joi.object({
  // Database: either DATABASE_URL or all of DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME
  DATABASE_URL: Joi.string().optional().allow(''),
  DB_HOST: Joi.when(Joi.ref('DATABASE_URL'), {
    is: hasDatabaseUrl,
    then: Joi.string().optional(),
    otherwise: Joi.string().required().messages({
      'any.required': 'DB_HOST is required when DATABASE_URL is not set',
    }),
  }),
  DB_PORT: Joi.string().optional().default('5432'),
  DB_USERNAME: Joi.when(Joi.ref('DATABASE_URL'), {
    is: hasDatabaseUrl,
    then: Joi.string().optional(),
    otherwise: Joi.string().required().messages({
      'any.required': 'DB_USERNAME is required when DATABASE_URL is not set',
    }),
  }),
  DB_PASSWORD: Joi.when(Joi.ref('DATABASE_URL'), {
    is: hasDatabaseUrl,
    then: Joi.string().optional(),
    otherwise: Joi.string().required().allow('').messages({
      'any.required': 'DB_PASSWORD is required when DATABASE_URL is not set',
    }),
  }),
  DB_NAME: Joi.when(Joi.ref('DATABASE_URL'), {
    is: hasDatabaseUrl,
    then: Joi.string().optional(),
    otherwise: Joi.string().required().messages({
      'any.required': 'DB_NAME is required when DATABASE_URL is not set',
    }),
  }),

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

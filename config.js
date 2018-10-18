/**
 * Create and export config vars
 */

// Container for environments
const environments = {};

// Staging (default) environment
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "staging"
};

// Production environment
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production"
};

// Current environment
const currentEnv = (process.env.NODE_ENV || "").toLowerCase();

// Export correct environment
module.exports = environments[currentEnv] || environments.staging;

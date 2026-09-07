const { query } = require("../config/database");

const getSiteSetting = async (key, defaultValue = null) => {
  const result = await query(
    `
    SELECT setting_value
    FROM site_settings
    WHERE setting_key = $1
    LIMIT 1
    `,
    [key]
  );

  if (result.rows.length === 0) {
    return defaultValue;
  }

  return result.rows[0].setting_value;
};

const getBooleanSiteSetting = async (
  key,
  defaultValue = false
) => {
  const value = await getSiteSetting(
    key,
    defaultValue ? "true" : "false"
  );

  return String(value).toLowerCase() === "true";
};

module.exports = {
  getSiteSetting,
  getBooleanSiteSetting,
};
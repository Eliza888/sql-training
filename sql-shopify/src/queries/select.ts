import { APPS_CATEGORIES, CATEGORIES } from "../shopify-table-names";

export const selectCount = (table: string): string => {
  return `SELECT COUNT(*) AS count FROM ${table};`;
};

export const selectRowById = (id: number, table: string): string => {
  return `SELECT * FROM ${table} WHERE id = ${id};`;
};
;

export const selectCategoryByTitle = (title: string): string => {
  return `SELECT * FROM ${CATEGORIES} WHERE title = '${title}';`;
}

export const selectAppCategoriesByAppId = (appId: number): string => {
  return `
    SELECT apps.*, apps_categories.*
    FROM ${APPS_CATEGORIES}
    JOIN apps ON apps.id = ${APPS_CATEGORIES}.app_id
    WHERE ${APPS_CATEGORIES}.app_id = ${appId};
  `;
}

export const selectUnigueRowCount = (tableName: string, columnName: string): string => {
  return `SELECT COUNT(DISTINCT ${columnName}) AS count FROM ${tableName};`;
};

export const selectReviewByAppIdAuthor = (appId: number, author: string): string => {
  return `SELECT * FROM reviews WHERE app_id = ${appId} AND author = '${author}';`;
};

export const selectColumnFromTable = (columnName: string, tableName: string): string => {
  return `SELECT ${columnName} FROM ${tableName};`;
};
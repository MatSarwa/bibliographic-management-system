'use strict';

// Migration 12 was meant to allow NULL in collections.owner_id (workspace collections have no
// personal owner), but on PostgreSQL Sequelize's changeColumn with `references` silently keeps
// NOT NULL. Without this, no collection could be created inside a workspace on databases built
// from migrations. DROP NOT NULL is a no-op when the column is already nullable.
module.exports = {
  async up(queryInterface) {
    if (queryInterface.sequelize.getDialect() !== 'postgres') return;
    await queryInterface.sequelize.query('ALTER TABLE collections ALTER COLUMN owner_id DROP NOT NULL');
  },

  async down() {
    // Not reversible safely: workspace collections legitimately have owner_id = NULL.
  }
};

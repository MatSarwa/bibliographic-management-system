'use strict';

// Migration 02 created `workspaces.owner_id`, but the Workspace model (and schema.sql) use
// `created_by`. Databases built from migrations therefore could not create any workspace.
// Safe on both kinds of databases: renames only when the old column is still there.
module.exports = {
  async up(queryInterface) {
    const columns = await queryInterface.describeTable('workspaces');
    if (columns.owner_id && !columns.created_by) {
      await queryInterface.renameColumn('workspaces', 'owner_id', 'created_by');
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable('workspaces');
    if (columns.created_by && !columns.owner_id) {
      await queryInterface.renameColumn('workspaces', 'created_by', 'owner_id');
    }
  }
};

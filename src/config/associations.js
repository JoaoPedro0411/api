const User = require('../models/user');
const UserAssets = require('../models/user-assets');
const Transaction = require('../models/transaction');

function applyAssociations() {
  
  User.hasMany(UserAssets, { foreignKey: 'user_id' });
  User.hasMany(Transaction, { foreignKey: 'user_id' });
  UserAssets.belongsTo(User, { foreignKey: 'user_id' });
  Transaction.belongsTo(User, {foreignKey:'user_id'});
}

module.exports = applyAssociations;
